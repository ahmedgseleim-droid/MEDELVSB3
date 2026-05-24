import { createHmac, timingSafeEqual } from "crypto";
import type { Request, Response, NextFunction } from "express";

export type UserRole = "admin" | "staff";
export interface AuthUser { username: string; role: UserRole; }

function getSecret(): string {
  return process.env.SESSION_SECRET ?? "dev-secret";
}

export function createToken(username: string, role: UserRole): string {
  const payload = Buffer.from(JSON.stringify({ username, role })).toString("base64url");
  const sig = createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyToken(token: string): AuthUser | null {
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac("sha256", getSecret()).update(payload).digest("hex");
  try {
    const a = Buffer.from(sig.padEnd(expected.length));
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch { return null; }
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString()) as AuthUser;
  } catch { return null; }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) { res.status(401).json({ error: "Unauthorized" }); return; }
  const user = verifyToken(auth.slice(7));
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }
  (req as Request & { user: AuthUser }).user = user;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const user = (req as Request & { user?: AuthUser }).user;
  if (!user || user.role !== "admin") { res.status(403).json({ error: "Admin only" }); return; }
  next();
}
