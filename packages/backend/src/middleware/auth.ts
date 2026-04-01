import type { Context, Next } from "hono";

// In-memory session tokens (cleared on server restart — admin just re-enters PIN)
const activeSessions = new Set<string>();

export function addSession(token: string) {
  activeSessions.add(token);
}

export function removeSession(token: string) {
  activeSessions.delete(token);
}

export function isValidSession(token: string): boolean {
  return activeSessions.has(token);
}

export async function adminAuth(c: Context, next: Next) {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const token = header.slice(7);
  if (!isValidSession(token)) {
    return c.json({ error: "Invalid or expired session" }, 401);
  }
  await next();
}
