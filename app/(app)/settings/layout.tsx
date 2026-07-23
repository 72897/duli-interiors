import { SettingsNav } from "@/components/settings-nav";
import { PageHead } from "@/components/app-ui";

/** Wayfinding for the settings area — already inside the (app) auth gate. */
export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <PageHead
        eyebrow="Account"
        title="Settings"
        intro="Your account, notifications, billing and connected services."
      />
      <SettingsNav />
      {children}
    </div>
  );
}
