export const getDisplayName = (user) => {
  if (!user) return '';
  return `${user.firstName || ''} ${user.lastName || ''}`.trim();
};

export const getInitials = (user) => {
  if (!user) return '';
  const first = user.firstName?.[0] || '';
  const last = user.lastName?.[0] || '';
  return `${first}${last}`.toUpperCase();
};

export const hasRole = (user, roles) => {
  if (!user?.role) return false;
  return Array.isArray(roles) ? roles.includes(user.role) : user.role === roles;
};
