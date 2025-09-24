// minimal RBAC policy sketch
export const Roles = { PUBLIC: "public", ADMIN: "admin" } as const;
export const Can = {
  analytics: ["admin"],
  accounting: ["admin"],
  streams_write: ["admin"],
  streams_read: ["public","admin"],
} as const;
export function requireRole(role: keyof typeof Roles | string, allowed: string[]) {
  return allowed.includes(role);
}
