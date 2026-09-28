import { getPortalAccount } from '@/lib/auth/portal';
import { BookingWizard } from './BookingWizard';

export default async function BookServicePage() {
  const account = await getPortalAccount();
  const profile = account?.profile ?? null;
  // Profiles may store +91-prefixed numbers; the wizard input expects 10 digits.
  const initialMobile = profile?.mobile ? profile.mobile.replace(/\D/g, '').slice(-10) : '';

  return (
    <BookingWizard
      initialName={profile?.full_name ?? ''}
      initialEmail={profile?.email ?? ''}
      initialMobile={initialMobile}
      isSignedIn={Boolean(profile)}
    />
  );
}
