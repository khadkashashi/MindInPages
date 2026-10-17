export const normalizeRole = (role?: string | null) => (role ?? "").toUpperCase();

export const canEditRole = (role?: string | null) =>
  ["OWNER", "ADMIN", "EDITOR"].includes(normalizeRole(role));

export const canManageRole = (role?: string | null) =>
  ["OWNER", "ADMIN"].includes(normalizeRole(role));