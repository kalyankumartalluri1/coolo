// Portal pages use PortalDashboard's own internal header.
// The public site Header, Footer, and MobileActionBar are intentionally absent.
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
