export const ROLES = Object.freeze({
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
  PARENT: 'PARENT',
});

export const ROLE_VALUES = Object.freeze(Object.values(ROLES));

/** Roles an owner can assign when creating users. */
export const ASSIGNABLE_ROLES = Object.freeze([
  ROLES.ADMIN,
  ROLES.TEACHER,
  ROLES.STUDENT,
  ROLES.PARENT,
]);

export const AUTH_PUBLIC_PATHS = Object.freeze([
  '/login',
  '/forgot-password',
  '/reset-password',
  '/setup',
]);
