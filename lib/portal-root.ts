/**
 * A single persistent DOM node for all app popovers/overlays (account menu,
 * back button, mobile drawer). Created once on the client and never removed.
 *
 * Why not portal straight into `document.body`? In Next's App Router the React
 * root spans the document, so `document.body` IS a React-managed container. A
 * portal appended there becomes a sibling of the router-rendered page content,
 * and when the page reconciles during a client navigation React can lose track
 * of the portal node — throwing "removeChild: node is not a child" as it tears
 * the old tree down. Portaling into a stable child div that React itself never
 * created isolates portal content from that root reconciliation: React only
 * ever adds/removes the portal's OWN nodes inside it, and the div persists.
 */
let root: HTMLElement | null = null;

export function getPortalRoot(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  if (!root || !root.isConnected) {
    root = document.getElementById("app-portal-root") as HTMLElement | null;
    if (!root || !root.isConnected) {
      root = document.createElement("div");
      root.id = "app-portal-root";
      document.body.appendChild(root);
    }
  }
  return root;
}
