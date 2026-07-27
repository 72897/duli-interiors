import type { Metadata } from "next";
import { MapPin, Package } from "lucide-react";
import { getVendorPlacements } from "@/lib/services";
import { PageHead, Panel } from "@/components/app-ui";
import { EmptyState } from "@/components/dashboard-ui";

export const metadata: Metadata = { title: "Leads — Vendor — Duli Interiors" };

export default async function VendorLeadsPage() {
  const placements = await getVendorPlacements();
  const total = placements.reduce((s, p) => s + p.placements, 0);

  return (
    <div>
      <PageHead
        eyebrow="Vendor portal"
        title="Leads"
        intro="Where designers have specified your products across Duli projects."
      />

      {placements.length === 0 ? (
        <EmptyState
          title="No placements yet"
          description="When a designer adds one of your products to a project, it shows up here with the count and the cities — so you can see what's in demand."
          ctaHref="/vendor/catalog"
          ctaLabel="Review your SKUs"
        />
      ) : (
        <>
          <p className="mb-4 text-[13px] text-muted">
            <span className="font-semibold text-ink">{total}</span> placement
            {total === 1 ? "" : "s"} across {placements.length} product
            {placements.length === 1 ? "" : "s"}.
          </p>
          <div className="space-y-3">
            {placements.map((p) => (
              <Panel
                key={p.catalogItemId}
                className="flex flex-wrap items-center justify-between gap-4 p-5"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-olive/12 text-olive ring-1 ring-olive/20">
                    <Package size={18} strokeWidth={1.8} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold">{p.itemName}</p>
                    {p.cities.length > 0 && (
                      <p className="mt-0.5 flex items-center gap-1 text-[12.5px] text-muted">
                        <MapPin size={12} strokeWidth={1.8} />
                        {p.cities.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-serif text-[22px] leading-none">{p.placements}</p>
                  <p className="text-[11px] text-muted">
                    placement{p.placements === 1 ? "" : "s"}
                  </p>
                </div>
              </Panel>
            ))}
          </div>
          <p className="mt-4 text-[11.5px] text-muted">
            Aggregated for your privacy and the customer&apos;s — counts and cities
            only, never project or customer details.
          </p>
        </>
      )}
    </div>
  );
}
