import { Router, type IRouter } from "express";
import healthRouter from "./health";
import cabinsRouter from "./cabins";
import leadsRouter from "./leads";
import analysisRouter from "./analysis";
import tenantsRouter from "./tenants";
import widgetRouter from "./widget";

const router: IRouter = Router();

router.use(healthRouter);
router.use(cabinsRouter);
router.use(leadsRouter);
router.use(analysisRouter);
router.use(tenantsRouter);
router.use(widgetRouter);

export default router;
