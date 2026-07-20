/**
 * Duli Partner Programs.
 *
 * Descriptive only — commercial terms (commission rates, revenue share,
 * discounts, payment cycles, eligibility thresholds) are deliberately NOT
 * stated here. Those are business decisions and must be supplied by Duli
 * before this page is published.
 */

export type ProgramId = "execution" | "design_studio" | "affiliate" | "education";

export type Program = {
  id: ProgramId;
  name: string;
  tagline: string;
  who: string;
  benefits: string[];
};

export const PROGRAMS: Program[] = [
  {
    id: "execution",
    name: "Execution Partner",
    tagline: "Build Duli projects in your city",
    who: "Contractors, carpenters, modular units, painters, electricians, plumbers and site supervisors.",
    benefits: [
      "A steady flow of vetted projects in your city",
      "Standardised scopes, drawings and quotations",
      "A dedicated project manager as your single point of contact",
      "Work under a professional brand customers already trust",
      "Clear milestones and structured handovers",
    ],
  },
  {
    id: "design_studio",
    name: "Design Studio Partner",
    tagline: "Design with Duli, deliver with Duli",
    who: "Independent interior designers and studios who want execution handled end to end.",
    benefits: [
      "Use the AI visualiser to pitch concepts to your clients",
      "Hand execution to a vetted Duli city team",
      "Keep your client relationship and your design credit",
      "Transparent, standardised BOQs and quotations",
      "Priority designer review on generated concepts",
    ],
  },
  {
    id: "affiliate",
    name: "Affiliate Partner",
    tagline: "Refer homeowners, earn on every project",
    who: "Real-estate agents, builders, architects, influencers and community owners.",
    benefits: [
      "Refer homeowners with a simple tracked link",
      "Transparent status on every referral you send",
      "Your clients get the same reviewed, transparent process",
      "Marketing material and support from the Duli team",
    ],
  },
  {
    id: "education",
    name: "Education Partner",
    tagline: "Bring real interior workflows into the classroom",
    who: "Design colleges, interior design institutes and student communities.",
    benefits: [
      "Platform access for studio and classroom projects",
      "Real Indian project briefs and case studies",
      "Workshops and sessions with practising Duli designers",
      "A pathway from student projects to internships",
    ],
  },
];

export const programLabel = (id: ProgramId) =>
  PROGRAMS.find((p) => p.id === id)?.name ?? id;
