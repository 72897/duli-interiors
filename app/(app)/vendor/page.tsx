import type { Metadata } from "next";
import { Package, Store, FileText, CheckCircle2 } from "lucide-react";
import {
  getMyRoles,
  isAdminRole,
  getVendors,
  getCatalogItems,
  getMyVendor,
  getMyVendorItems,
} from "@/lib/services";
import { PageHead, Panel, Pill, SectionTitle } from "@/components/app-ui";
import { StatCard } from "@/components/dashboard-ui";

export const metadata: Metadata = { title: "Vendor Portal — Duli Interiors" };

export default async function VendorPage() {
  const roles = await getMyRoles();
  const isAdmin = isAdminRole(roles);

  if (isAdmin) {
    // Admin oversight — the whole vendor directory with real counts.
    const [vendors, items] = await Promise.all([getVendors(), getCatalogItems()]);
    const approved = vendors.filter((v) => v.approved).length;
    const listed = items.filter((i) => i.status === "active").length;

    return (
      <div>
        <PageHead
          eyebrow="Admin view"
          title="Vendor Portal"
          intro="Brands and suppliers on the platform — you're seeing this as an admin."
        />
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

  // Vendor view — their own brand and SKUs.
  const [vendor, myItems] = await Promise.all([getMyVendor(), getMyVendorItems()]);
  const live = myItems.filter((i) => i.status === "active").length;
  const drafts = myItems.filter((i) => i.status !== "active").length;

  return (
    <div>
      <PageHead
        eyebrow="Vendor portal"
        title={vendor ? vendor.name : "Vendor Portal"}
        intro="Your SKUs and availability across Duli projects."
        actions={
          <a href="/vendor/products/new" className="btn-solid h-10 text-[13px]">
            Add product <span aria-hidden="true">→</span>
          </a>
        }
      />

      {!vendor ? (
        <Panel className="p-6">
          <p className="text-[14px] font-semibold">Not linked to a vendor yet</p>
          <p className="mt-1.5 max-w-[52ch] text-[13px] text-muted">
            Your account isn&apos;t connected to a vendor organisation. Ask a Duli
            admin to link it — then your SKUs, drafts and brand profile appear
            here.
          </p>
        </Panel>
      ) : (
        <>
          <div className="mb-4 flex items-center gap-2.5">
            {vendor.approved ? (
              <Pill tone="olive">Approved — your live SKUs are public</Pill>
            ) : (
              <Pill tone="brass">Pending review — SKUs go live once approved</Pill>
            )}
          </div>

          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <StatCard label="Total SKUs" value={myItems.length} />
            <StatCard label="Live" value={live} />
            <StatCard label="Drafts" value={drafts} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <a href="/vendor/catalog" className="group">
              <Panel className="h-full p-5">
                <Package size={18} strokeWidth={1.8} className="text-olive" />
                <p className="mt-3 text-[14.5px] font-semibold">My SKUs</p>
                <p className="mt-1 text-[12.5px] text-muted">
                  Review your products and their live/draft status.
                </p>
              </Panel>
            </a>
            <a href="/vendor/products/new" className="group">
              <Panel className="h-full p-5">
                <FileText size={18} strokeWidth={1.8} className="text-brass" />
                <p className="mt-3 text-[14.5px] font-semibold">Add a product</p>
                <p className="mt-1 text-[12.5px] text-muted">
                  Submit a new SKU — it goes live after admin approval.
                </p>
              </Panel>
            </a>
            <a href="/vendor/profile" className="group">
              <Panel className="h-full p-5">
                <CheckCircle2 size={18} strokeWidth={1.8} className="text-olive" />
                <p className="mt-3 text-[14.5px] font-semibold">Brand profile</p>
                <p className="mt-1 text-[12.5px] text-muted">
                  Edit your brand name, city and categories.
                </p>
              </Panel>
            </a>
          </div>
        </>
      )}
    </div>
  );
}
