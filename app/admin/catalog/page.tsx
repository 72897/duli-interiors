import type { Metadata } from "next";
import { getCatalogItems } from "@/lib/services";
import { Panel, Pill, inr } from "@/components/app-ui";
import { CatalogItemForm } from "@/components/catalog-item-form";

export const metadata: Metadata = { title: "Catalog — Admin — Duli Interiors" };

export default async function AdminCatalogPage() {
  const items = await getCatalogItems();

  return (
    <div>
      <h1 className="font-serif text-[26px] leading-tight">Catalog management</h1>
      <p className="mt-1.5 text-[13px] text-muted">
        Every item across the catalog, with status and price band. Editing and
        archiving existing items are coming next — adding a new design is live.
      </p>

      {/* Live admin write-path — inserts into catalog_items (RLS admin-only). */}
      <div className="my-5">
        <CatalogItemForm />
      </div>

      <Panel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-[13px]">
            <thead>
              <tr className="border-b border-ink/[0.07] text-left text-[10.5px] uppercase tracking-[0.12em] text-muted">
                <th className="px-5 py-3 font-semibold">Item</th>
                <th className="px-3 py-3 font-semibold">Category</th>
                <th className="px-3 py-3 font-semibold">Tier</th>
                <th className="px-3 py-3 font-semibold">Price</th>
                <th className="px-3 py-3 font-semibold">Vendor</th>
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
                  <td className="px-3 py-3 capitalize text-muted">{item.budgetTier}</td>
                  <td className="px-3 py-3 tabular-nums text-muted">
                    {inr(item.priceMin)}
                  </td>
                  <td className="px-3 py-3 text-muted">{item.vendorName || "—"}</td>
                  <td className="px-5 py-3">
                    <Pill tone={item.status === "active" ? "olive" : "neutral"}>
                      {item.status}
                    </Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
