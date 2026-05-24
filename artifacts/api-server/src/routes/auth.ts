import { Router, type IRouter } from "express";
import { createToken, type UserRole } from "../middleware/requireAuth";

const router: IRouter = Router();

// Allowed staff usernames (add more here later)
const STAFF_USERS = ["USER1","USER2","USER3","USER4","USER5","USER6","USER7"];

router.post("/auth/login", (req, res): void => {
  const { username, password } = req.body as { username?: string; password?: string };

  if (!password) {
    res.status(401).json({ error: "Password required" });
    return;
  }

  const adminPassword = process.env.APP_PASSWORD ?? "";
  const staffPassword = process.env.STAFF_PASSWORD ?? "";

  // Admin login — no username required
  if (password === adminPassword) {
    const token = createToken("admin", "admin");
    res.json({ token, role: "admin", username: "admin" });
    return;
  }

  // Staff login — username required and must be in allowed list
  if (password === staffPassword) {
    if (!username || !STAFF_USERS.includes(username.toUpperCase())) {
      req.log.warn("Staff login: invalid or missing username");
      res.status(401).json({ error: "Invalid username" });
      return;
    }
    const normalizedUsername = username.toUpperCase();
    const token = createToken(normalizedUsername, "staff");
    res.json({ token, role: "staff", username: normalizedUsername });
    return;
  }

  req.log.warn("Failed login attempt");
  res.status(401).json({ error: "Incorrect password" });
});

export default router;
