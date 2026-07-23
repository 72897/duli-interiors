import { getMyRoles, isAdminRole } from "@/lib/services";
import { AccessDenied } from "@/components/access-denied";
import { VendorNav } from "@/components/vendor-nav";

/**
 * Single gate for the vendor portal. Admins get in because they support
 * vendors; vendors get their own. Everyone else sees the denied panel. Sub-
 * pages assume they're already past this — RLS still scopes real data.
 */
export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const roles = await getMyRoles();
  const allowed = isAdminRole(roles) || roles.includes("vendor");

  if (!allowed) {
    return (
      <AccessDenied
        roles={roles}
        title="Vendor access only"
        message="This portal is for brands and suppliers listing products on Duli. Your account doesn't have a vendor role — that's by design, not an error."
        applyHref="/partners"
        applyLabel="Apply to partner"
      />
    );
  }

  return (
    <div>
      <VendorNav />
      {children}
    </div>
  );
}
