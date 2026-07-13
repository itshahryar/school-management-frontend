export const ROLES = Object.freeze({
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
});

export const ROLE_VALUES = Object.freeze(Object.values(ROLES));

/** Roles an owner can assign when creating users. */
export const ASSIGNABLE_ROLES = Object.freeze([ROLES.ADMIN]);

export const AUTH_PUBLIC_PATHS = Object.freeze([
  '/login',
  '/forgot-password',
  '/reset-password',
  '/setup',
]);

/** Role → home dashboard path */
export const getDashboardPath = (role) =>
  role === ROLES.OWNER ? '/dashboard/owner' : '/dashboard/admin';
