import { Router } from "express";
import { getSubscribers,groupSubescriber } from "./subscribers";
const router = Router();

router.post("/getSubscribers", getSubscribers);
router.post("/groupSubescriber", groupSubescriber);



export default router;
