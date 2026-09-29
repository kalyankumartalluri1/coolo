import { getPortalAccount } from '@/lib/auth/portal';
import { getServiceCatalog, type ServiceCatalogEntry } from '@/lib/catalog';
import { BookingWizard } from './BookingWizard';

export default async function BookServicePage() {
  const [account, catalog] = await Promise.all([getPortalAccount(), getServiceCatalog()]);
  const profile = account?.profile ?? null;
  // Profiles may store +91-prefixed numbers; the wizard input expects 10 digits.
  const initialMobile = profile?.mobile ? profile.mobile.replace(/\D/g, '').slice(-10) : '';

  const catalogPricing: ServiceCatalogEntry[] = catalog;

  return (
    <BookingWizard
      initialName={profile?.full_name ?? ''}
      initialEmail={profile?.email ?? ''}
      initialMobile={initialMobile}
      isSignedIn={Boolean(profile)}
      catalog={catalogPricing}
    />
  );
}
