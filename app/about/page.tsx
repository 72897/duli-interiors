import type { Metadata } from "next";
import { CustomCursor, SiteInteractions } from "@/components/site-interactions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ScrollEngine } from "@/components/scroll-engine";
import { AboutHero } from "@/components/about-hero";
import { AboutContent } from "@/components/about-content";

export const metadata: Metadata = {
  title: "About Duli Interiors | Interior Design & Execution Company",
  description: "Duli Interiors is an independent interior solutions company created to make home and office interiors more organized, transparent, and execution-focused."
};

export default function AboutPage() {
  return (
    <>
      <link rel="preload" as="image" href="/assets/home%20page/Living%20Room.webp" />

      <CustomCursor />
      <SiteInteractions />
      <ScrollEngine />
      <SiteHeader />
      <AboutHero />
      <AboutContent />
      <SiteFooter />
    </>
  );
}
