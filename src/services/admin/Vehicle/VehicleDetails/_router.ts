import { Router } from "express";
import { get, create,getByid,update,Delete,devicesByOwnerID,updateMany,expVehicle } from "./vehicleDetails";
const router = Router();

router.post('/create', create);
router.post('/get', get);

router.post('/getByid',getByid );
router.post('/devicesByOwnerID',devicesByOwnerID );
router.post('/renewDevice',expVehicle );


router.post('/update', update);
router.post('/Delete', Delete);
router.post('/updateMany', updateMany);



export default router;