import type { Metadata } from "next";
import { PageHead } from "@/components/app-ui";
import { EmptyState } from "@/components/dashboard-ui";

export const metadata: Metadata = { title: "Leads — Vendor — Duli Interiors" };

export default function VendorLeadsPage() {
  return (
    <div>
      <PageHead
        eyebrow="Vendor portal"
        title="Leads"
        intro="When a designer specifies one of your products on a project, it shows up here."
      />

      {/* Honest empty state — lead routing isn't built, so there's nothing to fake */}
      <EmptyState
        title="No leads yet"
        description="Lead routing from projects isn't switched on yet. Once it is, every time your product is chosen for a room, you'll see the project, city and designer here."
        ctaHref="/vendor/catalog"
        ctaLabel="Review your SKUs"
      />
    </div>
  );
}
