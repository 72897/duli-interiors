import type { Metadata } from "next";
import { getMyVendorItems, getMyVendorId } from "@/lib/services";
import { PageHead, Panel, Pill, MockNotice, inr } from "@/components/app-ui";
import { EmptyState } from "@/components/dashboard-ui";

export const metadata: Metadata = { title: "My SKUs — Vendor — Duli Interiors" };

export default async function VendorCatalogPage() {
  const [items, vendorId] = await Promise.all([
    getMyVendorItems(),
    getMyVendorId(),
  ]);

  return (
    <div>
      <PageHead
        eyebrow="Vendor portal"
        title="My SKUs"
        intro="Products you've submitted to Duli. Drafts go live once an admin approves them."
        actions={
          <a href="/vendor/products/new" className="btn-solid h-10 text-[13px]">
            Add product <span aria-hidden="true">→</span>
          </a>
        }
      />

      {!vendorId ? (
        <MockNotice>
          Your account isn&apos;t linked to a vendor organisation yet. A Duli
          admin needs to connect it before you can list products.
        </MockNotice>
      ) : items.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Add your first SKU — it'll appear here as a draft and go live once approved."
          ctaHref="/vendor/products/new"
          ctaLabel="Add a product"
        />
      ) : (
        <Panel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-[13px]">
              <thead>
                <tr className="border-b border-ink/[0.07] text-left text-[10.5px] uppercase tracking-[0.12em] text-muted">
                  <th className="px-5 py-3 font-semibold">Product</th>
                  <th className="px-3 py-3 font-semibold">Category</th>
                  <th className="px-3 py-3 font-semibold">Price</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-ink/[0.05] last:border-0">
                    <td className="px-5 py-3">{item.name}</td>
                    <td className="px-3 py-3 capitalize text-muted">
                      {item.category.replace(/_/g, " ")}
                    </td>
                    <td className="px-3 py-3 tabular-nums text-muted">
                      {inr(item.priceMin)}
                    </td>
                    <td className="px-5 py-3">
                      <Pill tone={item.status === "active" ? "olive" : "brass"}>
                        {item.status === "active" ? "Live" : "Draft — pending approval"}
                      </Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
}
