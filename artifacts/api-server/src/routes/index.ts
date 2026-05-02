import { Router, type IRouter } from "express";
import healthRouter from "./health";
import cabinsRouter from "./cabins";
import leadsRouter from "./leads";
import analysisRouter from "./analysis";

const router: IRouter = Router();

router.use(healthRouter);
router.use(cabinsRouter);
router.use(leadsRouter);
router.use(analysisRouter);

export default router;
