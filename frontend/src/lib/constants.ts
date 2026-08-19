import type { UserRole } from '@/types';

export const ALL_ROLES: UserRole[] = ['TUTOR', 'SPORTS_REP'];

export const ROLE_LABELS: Record<UserRole, string> = {
  TUTOR: 'Sports Tutor',
  SPORTS_REP: 'Sports Representative',
};

export const ROLE_DOT_COLORS: Record<UserRole, string> = {
  TUTOR: 'bg-purple-500',
  SPORTS_REP: 'bg-blue-500',
};

export const ROLE_BADGE_COLORS_DARK: Record<UserRole, string> = {
  TUTOR: 'bg-purple-500',
  SPORTS_REP: 'bg-blue-500',
};

export const ROLE_BADGE_COLORS_LIGHT: Record<UserRole, string> = {
  TUTOR: 'bg-purple-100 text-purple-800',
  SPORTS_REP: 'bg-blue-100 text-blue-800',
};
