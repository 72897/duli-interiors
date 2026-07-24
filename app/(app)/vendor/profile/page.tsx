import type { Metadata } from "next";
import { getCurrentUser, getVendors } from "@/lib/services";
import { PageHead, Panel, Pill, MockNotice } from "@/components/app-ui";

export const metadata: Metadata = { title: "Vendor profile — Duli Interiors" };

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">
        {label}
      </dt>
      <dd className="mt-1 text-[14px]">{value || "—"}</dd>
    </div>
  );
}

export default async function VendorProfilePage() {
  const [user, vendors] = await Promise.all([getCurrentUser(), getVendors()]);
  // Stand-in vendor org until vendors are tied to accounts.
  const org = vendors[0];

  return (
    <div>
      <PageHead
        eyebrow="Vendor portal"
        title="Vendor profile"
        intro="How your brand appears to designers on Duli."
        actions={
          <a
            href="/settings"
            className="inline-flex h-10 cursor-pointer items-center rounded-full border border-ink px-5 text-[13px] font-medium transition-colors duration-200 hover:bg-ink hover:text-bg"
          >
            Edit account
          </a>
        }
      />

      <MockNotice>
        Vendor organisations aren&apos;t linked to accounts yet — the brand card
        below is sample data. Your contact details are real.
      </MockNotice>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel className="p-6">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">
            Brand
          </p>
          {org ? (
            <>
              <div className="mt-2 flex items-center gap-2.5">
                <h2 className="font-serif text-[22px]">{org.name}</h2>
                {org.approved ? (
                  <Pill tone="olive">Approved</Pill>
                ) : (
                  <Pill tone="brass">Pending review</Pill>
                )}
              </div>
              <dl className="mt-5 grid gap-5 sm:grid-cols-2">
                <Field label="City" value={org.city} />
                <Field label="Listed items" value={String(org.itemCount)} />
                <Field
                  label="Categories"
                  value={org.categories.map((c) => c.replace(/_/g, " ")).join(", ")}
                />
              </dl>
            </>
          ) : (
            <p className="mt-2 text-[13px] text-muted">No brand on file.</p>
          )}
        </Panel>

        <Panel className="p-6">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">
            Contact
          </p>
          <dl className="mt-3 grid gap-5 sm:grid-cols-2">
            <Field label="Name" value={user?.name ?? ""} />
            <Field label="Email" value={user?.email ?? ""} />
            <Field label="Phone" value={user?.phone ?? ""} />
            <Field label="City" value={(user?.city as string) ?? ""} />
          </dl>
        </Panel>
      </div>
    </div>
  );
}
