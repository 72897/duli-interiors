import type { Metadata } from "next";
import { CustomCursor, SiteInteractions } from "@/components/site-interactions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ScrollEngine } from "@/components/scroll-engine";
import { StyleQuiz } from "@/components/style-quiz";

export const metadata: Metadata = {
  title: "Style Quiz | Duli Interiors",
  description: "Answer 7 quick visual questions to discover your Duli interior design style."
};

export default function StyleQuizPage() {
  return (
    <>
      <CustomCursor />
      <SiteInteractions />
      <ScrollEngine />
      <SiteHeader />
      <main className="sq-page">
        <StyleQuiz />
      </main>
      <SiteFooter />
    </>
  );
}
