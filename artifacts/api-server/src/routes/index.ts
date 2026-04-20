import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import sessionsRouter from "./sessions";
import materialsRouter from "./materials";
import chatsRouter from "./chats";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(sessionsRouter);
router.use(materialsRouter);
router.use(chatsRouter);
router.use(dashboardRouter);

export default router;
