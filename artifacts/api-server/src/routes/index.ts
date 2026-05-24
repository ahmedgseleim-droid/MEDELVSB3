import { Router, type IRouter } from "express";
import healthRouter from "./health";
import recordsRouter from "./records";
import authRouter from "./auth";
import { requireAuth } from "../middleware/requireAuth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(requireAuth);
router.use(recordsRouter);

export default router;
