import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin, Wallet, Sparkles, ArrowRight } from "lucide-react";
import { CustomCursor, SiteInteractions } from "@/components/site-interactions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageBackdrop, BACKDROPS, GLASS } from "@/components/page-backdrop";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getCatalogItems } from "@/lib/services";
import {
  templateBySlug,
  relatedTemplates,
  thumbUrl,
  spaceLabel,
  styleLabel,
} from "@/lib/ideas/templates";

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const t = templateBySlug(params.slug);
  return {
    title: t ? `${t.title} | Duli Interiors` : "Design | Duli Interiors",
    description: t?.about,
  };
}

/**
 * Design/template detail — the Coohom "template preview" analogue. Click a
 * design → view it in full with its style, the products that make it up, and a
 * clear "use this design" action that seeds a project. NOT an immediate
 * "create project" prompt.
 */
export default async function DesignDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const t = templateBySlug(params.slug);
  if (!t) notFound();

  // Products that make up this look — matched from the catalog by room + style.
  const catalog = await getCatalogItems({ roomType: t.space });
  const products = catalog
    .filter((c) => c.styleTags.some((s) => s === (t.style as never)))
    .slice(0, 6);
  const fallbackProducts = products.length ? products : catalog.slice(0, 4);

  const related = relatedTemplates(t);
  const useHref = `/projects/new?space=${t.space}&style=${t.style}`;

  return (
    <>
      <CustomCursor />
      <SiteInteractions />
      <SiteHeader />

      <main data-app-ui className="font-sans text-ink">
        <PageBackdrop image={BACKDROPS.living} scrim="light" />

        <section className="mx-auto max-w-[1180px] px-6 pb-20 pt-32 md:pt-40">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Ideas", href: "/ideas" },
              { label: t.title },
            ]}
          />

          <div className="mt-5 grid gap-7 lg:grid-cols-[1.5fr_1fr]">
            {/* Hero */}
            <div className="overflow-hidden rounded-2xl border border-stone">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbUrl(t.photoId, 1200)}
                alt={`${t.title} — ${styleLabel(t.style)} ${spaceLabel(t.space)}`}
                className="h-full max-h-[560px] w-full object-cover"
              />
            </div>

            {/* Detail + actions */}
            <div className={`self-start p-7 ${GLASS}`}>
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-brass">
                {styleLabel(t.style)} · {spaceLabel(t.space)}
              </p>
              <h1 className="mt-2 font-serif text-[32px] leading-tight">{t.title}</h1>
              <p className="mt-3 text-[14.5px] leading-relaxed text-muted">{t.about}</p>

              <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[13px]">
                <div className="inline-flex items-center gap-1.5">
                  <MapPin size={14} strokeWidth={1.9} className="text-muted" />
                  {t.city}
                </div>
                <div className="inline-flex items-center gap-1.5 capitalize">
                  <Wallet size={14} strokeWidth={1.9} className="text-muted" />
                  {t.budget}
                </div>
              </dl>

              <div className="mt-6 flex flex-wrap gap-2.5">
                <a href={useHref} className="btn-solid h-11">
                  Use this design <ArrowRight size={15} strokeWidth={2} />
                </a>
                <a
                  href="/3d-studio"
                  className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-ink px-5 text-sm font-medium transition-colors duration-200 hover:bg-ink hover:text-bg"
                >
                  <Sparkles size={15} strokeWidth={1.9} /> Open 3D Studio
                </a>
              </div>
              <p className="mt-3 text-[11.5px] text-muted">
                Curated reference — we&apos;ll adapt it to your real room and
                measurements. Not an AI render of your space.
              </p>
            </div>
          </div>

          {/* Products in this design */}
          <div className="mt-12">
            <h2 className="font-serif text-[24px]">Products in this look</h2>
            <p className="mt-1 text-[13.5px] text-muted">
              Pieces from the Duli catalog that build this style — swappable
              when you make it yours.
            </p>
            <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
              {fallbackProducts.map((p) => (
                <a
                  key={p.id}
                  href="/catalog"
                  className="group overflow-hidden rounded-xl border border-stone bg-surface transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-olive"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 ease-premium group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="p-3">
                    <p className="truncate text-[13px] font-medium">{p.name}</p>
                    <p className="mt-0.5 text-[12px] text-muted">{inr(p.priceMin)}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Related designs */}
          {related.length > 0 && (
            <div className="mt-12">
              <h2 className="font-serif text-[24px]">More like this</h2>
              <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4">
                {related.map((r) => (
                  <a
                    key={r.slug}
                    href={`/ideas/${r.slug}`}
                    className="group overflow-hidden rounded-xl border border-stone bg-surface transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-olive"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumbUrl(r.photoId)}
                        alt={r.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 ease-premium group-hover:scale-[1.04]"
                      />
                    </div>
                    <div className="p-3">
                      <p className="truncate text-[13px] font-medium">{r.title}</p>
                      <p className="mt-0.5 text-[12px] text-muted">
                        {styleLabel(r.style)}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
