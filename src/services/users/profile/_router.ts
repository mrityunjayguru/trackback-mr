import { Router } from "express";
import { update, allUser, uploadFile, deleteFile, viewMfile } from "./profile";
const router = Router();

router.post('/allUser', allUser);
router.post('/update', update);
router.post('/uploadFile', uploadFile);
router.post('/deleteFile', deleteFile);
router.post('/viewMfile',viewMfile);
export default router;