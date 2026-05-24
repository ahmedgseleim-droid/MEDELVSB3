import { createHmac, timingSafeEqual } from "crypto";
import type { Request, Response, NextFunction } from "express";

function getExpectedToken(): string {
  const secret = process.env.SESSION_SECRET ?? "dev-secret";
  const password = process.env.APP_PASSWORD ?? "";
  return createHmac("sha256", secret).update(password).digest("hex");
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = auth.slice(7);
  const expected = getExpectedToken();
  try {
    const tokenBuf = Buffer.from(token.padEnd(expected.length, " "));
    const expectedBuf = Buffer.from(expected);
    if (tokenBuf.length !== expectedBuf.length || !timingSafeEqual(tokenBuf, expectedBuf)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
  } catch {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

export function getAuthToken(): string {
  return getExpectedToken();
}
