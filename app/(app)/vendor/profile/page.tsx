import type { Metadata } from "next";
import { getCurrentUser, getMyVendor } from "@/lib/services";
import { PageHead, Panel, Pill } from "@/components/app-ui";
import { VendorProfileForm } from "@/components/vendor-profile-form";

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
  const [user, vendor] = await Promise.all([getCurrentUser(), getMyVendor()]);

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

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel className="p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">
              Brand
            </p>
            {vendor &&
              (vendor.approved ? (
                <Pill tone="olive">Approved</Pill>
              ) : (
                <Pill tone="brass">Pending review</Pill>
              ))}
          </div>

          {vendor ? (
            <div className="mt-3">
              <VendorProfileForm
                initialName={vendor.name}
                initialCity={vendor.city}
                initialCategories={vendor.categories}
              />
              <p className="mt-4 text-[11.5px] text-muted">
                {vendor.itemCount} listed item{vendor.itemCount === 1 ? "" : "s"} ·
                approval is set by the Duli team.
              </p>
            </div>
          ) : (
            <p className="mt-3 max-w-[46ch] text-[13px] text-muted">
              Your account isn&apos;t linked to a vendor organisation yet. Ask a
              Duli admin to connect it, then your brand profile appears here to
              edit.
            </p>
          )}
        </Panel>

        <Panel className="h-max p-6">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">
            Contact
          </p>
          <dl className="mt-3 grid gap-5 sm:grid-cols-2">
            <Field label="Name" value={user?.name ?? ""} />
            <Field label="Email" value={user?.email ?? ""} />
            <Field label="Phone" value={user?.phone ?? ""} />
            <Field label="City" value={(user?.city as string) ?? ""} />
          </dl>
          <p className="mt-4 text-[11.5px] text-muted">
            Contact details come from your account. Update them in{" "}
            <a href="/settings" className="text-olive underline underline-offset-2">
              Settings
            </a>
            .
          </p>
        </Panel>
      </div>
    </div>
  );
}
