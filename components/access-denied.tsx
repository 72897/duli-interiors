import { ShieldAlert } from "lucide-react";
import { ROLE_LABELS, type Role } from "@/lib/types";
import { GLASS } from "@/components/page-backdrop";

/**
 * Shared access-denied panel (spec §13 / utility pages). One definition so the
 * admin gate, the vendor gate and the standalone /access-denied route all read
 * identically instead of drifting.
 */
export function AccessDenied({
  roles = [],
  title = "You don't have access",
  message = "This area needs a role your account doesn't have — that's by design, not an error.",
  applyHref = "/contact",
  applyLabel = "Request access",
}: {
  roles?: Role[];
  title?: string;
  message?: string;
  applyHref?: string;
  applyLabel?: string;
}) {
  return (
    <div className={`mx-auto max-w-[34rem] px-8 py-12 text-center ${GLASS}`}>
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-terracotta/10 text-terracotta">
        <ShieldAlert size={26} strokeWidth={1.6} />
      </span>
      <h1 className="mt-5 font-serif text-[28px] leading-tight sm:text-[30px]">
        {title}
      </h1>
      <p className="mx-auto mt-3 max-w-[42ch] text-[14.5px] text-muted">{message}</p>
      <p className="mt-4 text-[12.5px] text-muted">
        Signed in as:{" "}
        <span className="text-ink">
          {roles.length
            ? roles.map((r) => ROLE_LABELS[r] ?? r).join(", ")
            : "Customer"}
        </span>
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <a href="/dashboard" className="btn-solid h-11">
          Back to your studio <span aria-hidden="true">→</span>
        </a>
        <a
          href={applyHref}
          className="inline-flex h-11 cursor-pointer items-center rounded-full border border-ink px-5 text-sm font-medium transition-colors duration-200 hover:bg-ink hover:text-bg"
        >
          {applyLabel}
        </a>
      </div>
    </div>
  );
}
