import "server-only";

/**
 * Minimal Resend client over the REST API (no SDK dependency).
 *
 * Email is best-effort: every send is wrapped so a failure NEVER breaks the
 * request that triggered it (a project still submits even if the alert email
 * bounces). Returns whether it sent, for callers that care.
 *
 * Config (all in .env.local, server-only):
 *   RESEND_API_KEY   — required to send; without it this no-ops.
 *   RESEND_FROM      — from address (verified domain, or onboarding@resend.dev in test mode).
 *   DULI_TEAM_EMAIL— where team/admin alerts go.
 */

const API = "https://api.resend.com/emails";

export function teamInbox(): string | null {
  return process.env.DULI_TEAM_EMAIL || null;
}

export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<{ sent: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "Duli Interiors <onboarding@resend.dev>";
  if (!key) return { sent: false, error: "RESEND_API_KEY not set" };

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(opts.to) ? opts.to : [opts.to],
        subject: opts.subject,
        html: opts.html,
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      }),
      // Don't let a slow mail API hang the server action.
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { sent: false, error: `Resend ${res.status}: ${body.slice(0, 200)}` };
    }
    return { sent: true };
  } catch (err) {
    return { sent: false, error: err instanceof Error ? err.message : "send failed" };
  }
}

/** Wraps body copy in Duli's brand shell. Inline styles — email clients demand it. */
export function brandedEmail(opts: {
  heading: string;
  bodyHtml: string;
  ctaText?: string;
  ctaUrl?: string;
}): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://duliinteriors.com";
  const cta =
    opts.ctaText && opts.ctaUrl
      ? `<tr><td style="padding:8px 0 4px"><a href="${opts.ctaUrl}" style="display:inline-block;background:#1f1f1f;color:#f8f7f4;text-decoration:none;font-weight:600;font-size:14px;padding:11px 22px;border-radius:999px">${opts.ctaText} →</a></td></tr>`
      : "";
  return `<!doctype html><html><body style="margin:0;background:#f8f7f4;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1f1f1f">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f4;padding:28px 0">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #d8d2c8;border-radius:14px;overflow:hidden">
        <tr><td style="padding:22px 28px;border-bottom:1px solid #ece7df">
          <span style="font-size:17px;font-weight:700;letter-spacing:-.2px">Duli<span style="color:#b08d57"> Interiors</span></span>
        </td></tr>
        <tr><td style="padding:26px 28px">
          <h1 style="margin:0 0 12px;font-size:20px;line-height:1.3">${opts.heading}</h1>
          <div style="font-size:14px;line-height:1.6;color:#4a4a45">${opts.bodyHtml}</div>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:16px">${cta}</table>
        </td></tr>
        <tr><td style="padding:16px 28px;border-top:1px solid #ece7df;font-size:11px;color:#8a8a82">
          <a href="${site}" style="color:#8a8a82">duliinteriors.com</a> · Designing homes people love living in
        </td></tr>
      </table>
    </td></tr>
  </table></body></html>`;
}
