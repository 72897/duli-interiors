import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import "./tailwind.css";

export const metadata: Metadata = {
  title: "Duli Interiors",
  description: "Designing homes people love living in. Premium interiors with complete transparency."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Inter+Tight:ital,wght@0,400;0,500;0,600;0,700;0,800;1,500&family=Josefin+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&display=swap"
          rel="stylesheet"
        />
        <Script
          type="module"
          src="https://unpkg.com/@google/model-viewer@3.5.0/dist/model-viewer.min.js"
          strategy="beforeInteractive"
        />
        {/* Starts downloading the sofa GLB in the background on every page, at low
            browser priority, so by the time someone navigates to /design it's
            already cached and the model appears instantly instead of loading live. */}
        <link rel="prefetch" href="/3d/sofa-opt.glb" as="fetch" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
