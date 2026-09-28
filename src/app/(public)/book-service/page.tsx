import { getPortalAccount } from '@/lib/auth/portal';
import { BookingWizard } from './BookingWizard';

export default async function BookServicePage() {
  const account = await getPortalAccount();
  const profile = account?.profile ?? null;

  return (
    <BookingWizard
      initialName={profile?.full_name ?? ''}
      initialEmail={profile?.email ?? ''}
      isSignedIn={Boolean(profile)}
    />
  );
}
