/**
 * Duli plan definitions.
 *
 * Confirmed by the business: Free = first 10 AI concept generations, then the
 * main paid plan is ₹999/month. Yearly billing follows a ~17% discount.
 *
 * NOTE: the Studio/Enterprise figures, generation allowances and feature lists
 * below are a PROPOSAL and must be confirmed before launch.
 */

export type Billing = "monthly" | "yearly";

export type Plan = {
  id: string;
  name: string;
  audience: string;
  blurb: string;
  /** Price in ₹ per month when billed monthly. null = custom/contact. */
  monthly: number | null;
  /** Price in ₹ per month when billed yearly (already discounted). */
  yearlyPerMonth: number | null;
  /** Total ₹ billed once per year. */
  yearlyTotal: number | null;
  features: string[];
  cta: { label: string; href: string };
  popular?: boolean;
};

export const YEARLY_SAVE_PCT = 17;

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    audience: "Homeowners starting out",
    blurb: "Try the visualiser on your own room, at no cost.",
    monthly: 0,
    yearlyPerMonth: 0,
    yearlyTotal: 0,
    features: [
      "10 AI concept generations",
      "1 project",
      "Every concept reviewed by a Duli designer",
      "Core interior styles",
      "Email support",
    ],
    cta: { label: "Start free", href: "/register" },
  },
  {
    id: "home",
    name: "Home",
    audience: "For your own home",
    blurb: "For homeowners designing a full home, room by room.",
    monthly: 999,
    yearlyPerMonth: 833,
    yearlyTotal: 9990,
    features: [
      "100 AI concept generations / month",
      "Unlimited projects and rooms",
      "All interior styles",
      "2 revision rounds per concept",
      "Approximate estimate",
      "Priority designer review",
    ],
    cta: { label: "Get started", href: "/register" },
    popular: true,
  },
  {
    id: "studio",
    name: "Studio",
    audience: "Designers & small teams",
    blurb: "For interior designers running multiple client projects.",
    monthly: 2499,
    yearlyPerMonth: 2083,
    yearlyTotal: 24990,
    features: [
      "400 AI concept generations / month",
      "Everything in Home",
      "3 team seats",
      "Floor-plan analysis",
      "Downloadable branded proposals",
      "Priority support",
    ],
    cta: { label: "Get started", href: "/register" },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    audience: "Organisations",
    blurb: "Custom volume, seats and support for larger teams.",
    monthly: null,
    yearlyPerMonth: null,
    yearlyTotal: null,
    features: [
      "Custom generation volume",
      "Unlimited seats",
      "Dedicated project manager",
      "Onboarding and training",
      "Custom integrations & SLA",
    ],
    cta: { label: "Talk to us", href: "/#contact" },
  },
];

/** ₹ with Indian digit grouping, no decimals. */
export const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
