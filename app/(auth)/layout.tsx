import { PageBackdrop, BACKDROPS } from "@/components/page-backdrop";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      data-app-ui
      className="relative flex min-h-screen flex-col font-sans text-ink"
    >
      <PageBackdrop image={BACKDROPS.warm} scrim="dark" />

      <header className="flex h-[72px] items-center px-5 sm:px-14">
        {/* Scrim is only 5%, so the wordmark carries its own contrast. */}
        <a
          href="/"
          className="text-lg font-bold tracking-tight text-white [text-shadow:0_2px_12px_rgba(31,31,31,0.85)]"
          aria-label="Duli Interiors home"
        >
          Duli<span className="text-brass"> Interiors</span>
        </a>
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        {children}
      </main>
    </div>
  );
}
