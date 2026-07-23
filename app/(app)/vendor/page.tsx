import type { Metadata } from "next";
import { Package, Store } from "lucide-react";
import { getMyRoles, isAdminRole, getVendors, getCatalogItems } from "@/lib/services";
import { PageHead, Panel, Pill, MockNotice, SectionTitle } from "@/components/app-ui";
import { StatCard } from "@/components/dashboard-ui";

export const metadata: Metadata = { title: "Vendor Portal — Duli Interiors" };

export default async function VendorPage() {
  // Access is enforced by the vendor layout; here we only tailor the copy.
  const roles = await getMyRoles();
  const isAdmin = isAdminRole(roles);

  const [vendors, items] = await Promise.all([getVendors(), getCatalogItems()]);
  const approved = vendors.filter((v) => v.approved).length;
  const listed = items.filter((i) => i.status === "active").length;

  return (
    <div>
      <PageHead
        eyebrow={isAdmin ? "Admin view" : "Vendor portal"}
        title="Vendor Portal"
        intro={
          isAdmin
            ? "Brands and suppliers on the platform — you're seeing this as an admin."
            : "Your SKUs, availability and leads across Duli projects."
        }
        actions={
          <a href="/vendor/products/new" className="btn-solid h-10 text-[13px]">
            Add product <span aria-hidden="true">→</span>
          </a>
        }
      />

      <MockNotice>
        Vendor data is sample content. SKU upload, lead routing and order
        management are not built yet.
      </MockNotice>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Vendors" value={vendors.length} />
        <StatCard label="Approved" value={approved} />
        <StatCard label="Live SKUs" value={listed} />
      </div>

      <SectionTitle>Directory</SectionTitle>
      <div className="space-y-3">
        {vendors.map((v) => (
          <Panel key={v.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="flex min-w-0 items-center gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-olive/12 text-olive ring-1 ring-olive/20">
                <Store size={18} strokeWidth={1.8} />
              </span>
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
            </div>
            <div className="flex shrink-0 items-center gap-1.5 text-[12.5px] text-muted">
              <Package size={13} strokeWidth={1.8} />
              {v.itemCount} items
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
