// placeholder middleware hook; wire into Next's middleware.ts
export function getUserRole(req: Request): "admin" | "public" {
  // TODO: verify JWT/session; default public for now
  return "public";
}
