import type { Metadata } from "next";
import { PageHead, Panel } from "@/components/app-ui";
import { VendorProductForm } from "@/components/vendor-product-form";

export const metadata: Metadata = { title: "Add product — Vendor — Duli Interiors" };

export default function VendorNewProductPage() {
  return (
    <div>
      <PageHead
        eyebrow="Vendor portal"
        title="Add a product"
        intro="List a new SKU for designers to specify on Duli projects. It's saved as a draft and goes live once a Duli admin approves it."
      />

      <Panel className="max-w-[640px] p-6">
        <VendorProductForm />
      </Panel>
    </div>
  );
}
