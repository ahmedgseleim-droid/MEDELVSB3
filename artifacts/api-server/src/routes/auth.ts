import { Router, type IRouter } from "express";
import { getAuthToken } from "../middleware/requireAuth";

const router: IRouter = Router();

router.post("/auth/login", (req, res): void => {
  const { password } = req.body as { password?: string };
  const expected = process.env.APP_PASSWORD ?? "";

  if (!password || password !== expected) {
    req.log.warn("Failed login attempt");
    res.status(401).json({ error: "Incorrect password" });
    return;
  }

  res.json({ token: getAuthToken() });
});

export default router;
