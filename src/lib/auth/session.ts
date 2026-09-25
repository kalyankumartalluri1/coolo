import { UserRole } from '@/lib/types/database.types';

export interface CooloSession {
  userId: string;
  email?: string | null;
  role: UserRole;
  name?: string | null;
}

export function parseSessionCookie(raw: string | undefined | null): CooloSession | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.role) {
      return parsed as CooloSession;
    }
    return null;
  } catch {
    return null;
  }
}

export function getClientSession(): CooloSession | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)coolo_session=([^;]*)/);
  if (!match || !match[1]) return null;
  try {
    return parseSessionCookie(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

export function roleLabel(role: UserRole): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'Super Admin';
    case 'ADMIN':
      return 'Admin';
    case 'TECHNICIAN':
      return 'Technician';
    case 'CUSTOMER':
    default:
      return 'Customer';
  }
}

export function roleBadgeColor(role: UserRole): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'bg-rose-100 text-rose-700 border-rose-200';
    case 'ADMIN':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'TECHNICIAN':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'CUSTOMER':
    default:
      return 'bg-sky-100 text-sky-700 border-sky-200';
  }
}

