import type { Metadata } from "next";
import { Package } from "lucide-react";
import { getVendors } from "@/lib/services";
import { Panel, Pill, MockNotice } from "@/components/app-ui";
import { StatCard } from "@/components/dashboard-ui";
import { VendorApproveToggle } from "@/components/vendor-approve-toggle";

export const metadata: Metadata = { title: "Vendors — Admin — Duli Interiors" };

export default async function AdminVendorsPage() {
  const vendors = await getVendors();
  const pending = vendors.filter((v) => !v.approved).length;

  return (
    <div>
      <h1 className="font-serif text-[26px] leading-tight">Vendor management</h1>
      <p className="mt-1.5 text-[13px] text-muted">
        Brands and suppliers on the platform, and who&apos;s awaiting approval.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Vendors" value={vendors.length} />
        <StatCard label="Approved" value={vendors.length - pending} />
        <StatCard label="Awaiting review" value={pending} />
      </div>

      <div className="mt-5">
        <MockNotice>
          Approving a vendor is live — it makes them publicly visible. Vendor
          rows fall back to sample data until real vendors register.
        </MockNotice>
      </div>

      <div className="space-y-3">
        {vendors.map((v) => (
          <Panel key={v.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <p className="text-[15px] font-semibold">{v.name}</p>
                {v.approved ? (
                  <Pill tone="olive">Approved</Pill>
                ) : (
                  <Pill tone="brass">Pending review</Pill>
                )}
              </div>
              <p className="mt-0.5 text-[12.5px] text-muted">
                {v.city} · {v.categories.map((c) => c.replace(/_/g, " ")).join(", ")}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[12.5px] text-muted">
                <Package size={13} strokeWidth={1.8} />
                {v.itemCount} items
              </span>
              {/* Real approve/un-approve — writes vendors.approved (admin RLS). */}
              <VendorApproveToggle vendorId={v.id} approved={v.approved} />
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
