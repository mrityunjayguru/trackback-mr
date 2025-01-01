import { Router } from "express";
import { get, create,getByVehicleID,update,Delete,searchuser,Alerts,searchDevices,rootHistory } from "./vehicleTracking";
const router = Router();

router.post('/create', create);
router.post('/get', get);
router.post('/getByVehicleID',getByVehicleID );
router.post('/update', update);
router.post('/Delete', Delete);
router.post('/rootHistory', rootHistory);

router.post('/searchuser', searchuser);
router.post('/searchDevices', searchDevices);

router.post('/Alerts', Alerts);




export default router;