import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { getCatalogItems } from "@/lib/services";
import { PageHead, Panel, Pill, MockNotice, inr } from "@/components/app-ui";
import { EmptyState } from "@/components/dashboard-ui";
import Link from "next/link";
import { CATALOG_CATEGORIES, type BudgetTier, type CatalogCategory } from "@/lib/types";

export const metadata: Metadata = { title: "Catalog — Duli Interiors" };

const TIER_TONE: Record<BudgetTier, "neutral" | "brass" | "olive"> = {
  budget: "neutral",
  standard: "neutral",
  premium: "brass",
  luxury: "olive",
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  // Only pass through a category the type actually allows — a hand-typed query
  // string must never reach the service layer unvalidated.
  const category = CATALOG_CATEGORIES.find(
    (c) => c.value === searchParams.category,
  )?.value as CatalogCategory | undefined;

  const items = await getCatalogItems(category ? { category } : undefined);

  return (
    <div>
      <PageHead
        eyebrow="Sourcing"
        title="Catalog"
        intro="Furniture, materials and fittings we specify — priced for Indian cities, with availability by metro."
      />

      <MockNotice>
        Catalog items are sample data. Vendor SKUs and live pricing arrive with
        the vendor portal.
      </MockNotice>

      {/* Category filter — plain links so it works without JS. Frosted rail,
          because these chips sit over the backdrop photo. */}
      <div className="mb-6 flex flex-wrap gap-1.5 rounded-2xl border border-white/60 bg-white/70 p-2 backdrop-blur-xl">
        {/* scroll={false}: filtering shouldn't jump you back to the top. */}
        <Link
          href="/catalog"
          scroll={false}
          className={
            "cursor-pointer rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-colors duration-200 " +
            (!category ? "bg-ink text-bg" : "bg-white/60 text-ink hover:bg-ink/[0.06]")
          }
        >
          All
        </Link>
        {CATALOG_CATEGORIES.map((c) => (
          <Link
            key={c.value}
            href={`/catalog?category=${c.value}`}
            scroll={false}
            className={
              "cursor-pointer rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-colors duration-200 " +
              (category === c.value
                ? "bg-ink text-bg"
                : "bg-white/60 text-ink hover:bg-ink/[0.06]")
            }
          >
            {c.label}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Nothing in this category yet"
          description="We're still adding pieces here. Browse the full catalog in the meantime."
          ctaHref="/catalog"
          ctaLabel="View all items"
        />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
          {items.map((item) => (
            <Panel key={item.id} className="group flex flex-col">
              <div className="relative h-[168px] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[900ms] ease-premium group-hover:scale-[1.05]"
                />
                <span
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-ink/45 to-transparent"
                />
                <span className="absolute left-3 top-3">
                  <Pill tone={TIER_TONE[item.budgetTier] ?? "neutral"}>
                    {item.budgetTier}
                  </Pill>
                </span>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brass">
                  {item.category.replace(/_/g, " ")}
                </p>
                <h3 className="mt-1 font-serif text-[16.5px] leading-snug">
                  {item.name}
                </h3>

                {item.vendorName && (
                  <p className="mt-1 text-[12px] text-muted">{item.vendorName}</p>
                )}

                <p className="mt-3 font-serif text-[19px] tracking-tight">
                  {/* A range, because real quotes depend on finish and city. */}
                  {item.priceMin === item.priceMax
                    ? inr(item.priceMin)
                    : `${inr(item.priceMin)} – ${inr(item.priceMax)}`}
                </p>

                {item.cityAvailability.length > 0 && (
                  <p className="mt-auto flex items-center gap-1 pt-3 text-[11.5px] text-muted">
                    <MapPin size={12} strokeWidth={1.8} />
                    {item.cityAvailability.slice(0, 2).join(", ")}
                    {item.cityAvailability.length > 2 &&
                      ` +${item.cityAvailability.length - 2}`}
                  </p>
                )}
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
