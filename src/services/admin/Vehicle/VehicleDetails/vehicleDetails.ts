import { Request, Response } from "express";
import { Vehicle, Vehicleupdate, renewRequest } from "./_validation";
import _ from "lodash";
import mongoose from "mongoose";


export const create = async (req: Request, res: Response) => {
  try {
    const { deviceId, imei, vehicleNo, ownerID, deviceStatus, displayParameters, fuel, vehicleType, deviceType, deviceSimNumber, dealerCode, status } = req.body;

    // Check if the vehicle already exists based on deviceId, imei, or vehicleNo
    const existingVehicle:any = await Vehicle.findOne({
      $or: [{ deviceId }, { imei }, { vehicleNo }],
    });

    if (existingVehicle) {
      if (existingVehicle.deviceId === deviceId) {
        return res.status(400).json({ message: "Device ID Already Exists." });
      }
      if (existingVehicle.imei === imei) {
        return res.status(400).json({ message: "IMEI Already Exists." });
      }

    }

    // Prepare the vehicle data to create a new record
    const newVehicle:any = new Vehicle({
      deviceId,
      imei,
      vehicleNo,
      ownerID,
      deviceStatus,
      displayParameters: {
        AC: displayParameters.ac,
        Relay_Immobiliser: displayParameters.relay,
        GPS: displayParameters.gps,
        Door: displayParameters.door,
        GeoFencing: displayParameters.geofencing,
        Network: displayParameters.network,
        Engine: displayParameters.engine,
        Parking: displayParameters.parking,
        Charging: displayParameters.charging,
      },
      fuel,
      vehicleType,
      deviceType,
      deviceSimNumber,
      dealerCode,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Save the new vehicle document
    const savedVehicle = await newVehicle.save();

    // Send success response
    res.status(200).json({ data: savedVehicle, message: "Success" });

  } catch (error) {
    console.error("Error creating vehicle:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const get = async (req: Request, res: Response) => {
  let data: any;
  data = await Vehicle.find({ ownerID: req.body.ownerid });
  res.status(200).json({ data: data, message: "success", status: 200 });
};

export const getByid = async (req: Request, res: Response) => {
  let data: any;
  let payload = {};
  if (req.body._id) Object.assign(payload, { _id: req.body._id });
  data = await Vehicle.findOne(payload);
  res.status(200).json({ data: data, message: "success" });
};
export const devicesByOwnerID = async (req: Request, res: Response) => {
  let data: any;
  let payload = {
    ownerID: new mongoose.Types.ObjectId(req.body._id),
    // status: "Active",
  };
  data = await Vehicle.aggregate([
    {
      $match: payload,
    },
    {
      $lookup: {
        from: "vehicleType",
        localField: "vehicleType",
        foreignField: "_id",
        as: "vehicleTypeDetails",
      },
    },
    {
      $unwind: "$vehicleTypeDetails",
    },
  ]);
  res.status(200).json({ data: data, message: "success", status: 200 });
};
export const update = async (req: Request, res: Response) => {
  try {
    // Validate the incoming request data
    const { error } = Vehicleupdate(req.body);
    if (error) {
      return res.status(400).json({ message: error });
    }

    // Find the existing vehicle
    const vehicle = await Vehicle.findById(req.body._id);
    if (!vehicle) {
      return res.status(404).json({ message: "No record found." });
    }

    // Prepare the update payload
    let payload = {};
    Object.assign(payload, { updatedAt: new Date() });
    if (req.body.deviceId)
      Object.assign(payload, { deviceId: req.body.deviceId });
    if (req.body.imei) Object.assign(payload, { imei: req.body.imei });
    if (req.body.ownerID) Object.assign(payload, { ownerID: req.body.ownerID });
    if (req.body.deviceStatus) Object.assign(payload, { status: req.body.deviceStatus });
    if (req.body.vehicleNo)
      Object.assign(payload, { vehicleNo: req.body.vehicleNo });
    if (req.body.vehicleType)
      Object.assign(payload, { vehicleType: req.body.vehicleType });
    if (req.body.vehicleRegistrationNo)
      Object.assign(payload, {
        vehicleRegistrationNo: req.body.vehicleRegistrationNo,
      });
    if (req.body.driverName)
      Object.assign(payload, { driverName: req.body.driverName });
    if (req.body.mobileNo)
      Object.assign(payload, { mobileNo: req.body.mobileNo });
    if (req.body.vehicleBrand)
      Object.assign(payload, { vehicleBrand: req.body.vehicleBrand });
    if (req.body.vehicleModel)
      Object.assign(payload, { vehicleModel: req.body.vehicleModel });
    if (req.body.insuranceExpiryDate)
      Object.assign(payload, {
        insuranceExpiryDate: req.body.insuranceExpiryDate,
      });
    if (req.body.pollutionExpiryDate)
      Object.assign(payload, {
        pollutionExpiryDate: req.body.pollutionExpiryDate,
      });
    if (req.body.fitnessExpiryDate)
      Object.assign(payload, { fitnessExpiryDate: req.body.fitnessExpiryDate });
    if (req.body.nationalPermitExpiryDate)
      Object.assign(payload, {
        nationalPermitExpiryDate: req.body.nationalPermitExpiryDate,
      });
    if (req.body.fuelStatus)
      Object.assign(payload, {
        fuelStatus: req.body.fuelStatus,
      });
    if (req.body.subscriptionexp)
      Object.assign(payload, {
        subscriptionexp: req.body.subscriptionexp,
      });
    if (req.body.subscriptiostart)
      Object.assign(payload, {
        subscriptiostart: req.body.subscriptiostart,
      });
    if (req.body.maxSpeed)
      Object.assign(payload, {
        maxSpeed: req.body.maxSpeed,
      });
    if (req.body.parking==true || req.body.parking==false)
      Object.assign(payload, {
        parking: req.body.parking,
      });
    if (req.body.location)
      Object.assign(payload, {
        location: req.body.location,
      });
    if (req.body.Area)
      Object.assign(payload, {
        Area: req.body.Area,
      });
      if (req.body.dealerCode)
        Object.assign(payload, {
          dealerCode: req.body.dealerCode,
        });
        if (req.body.deviceSimNumber)
          Object.assign(payload, {
            deviceSimNumber: req.body.deviceSimNumber,
          });
          if (req.body.deviceType)
            Object.assign(payload, {
              deviceType: req.body.deviceType,
            });
            if (req.body.displayParameters)
              Object.assign(payload, {
                displayParameters: req.body.displayParameters,
              });
              if (req.body.operator)
                Object.assign(payload, {
                  operator: req.body.operator,
                });
                if (req.body.output)
                  Object.assign(payload, {
                    output: req.body.output,
                  });
                
    await Vehicle.updateOne({ _id: req.body._id }, payload);
    let data = await Vehicle.findOne({ _id: req.body._id });
    res.status(200).json({ data: data, message: "Update successful." });
  } catch (error: any) {
    if (error.code === 11000) {
      // Duplicate key error
      const duplicateField = Object.keys(error.keyValue)[0]; // Get the field that caused the duplication
      res.status(409).json({
        status: "error",
        message: `Duplicate entry detected for ${duplicateField}`,
        duplicateField: error.keyValue[duplicateField],
      });
    }
  }
};
export const Delete = async (req: Request, res: Response) => {
  let data: any;
  const vehicles: any = await Vehicle.findById(req.body._id);
  if (!vehicles) {
    return res.status(404).json({ message: "No record found." });
  }
  if (vehicles.status == false) {
    return res.status(409).json({ message: "Not Authrized to delete Record." });
  }

  data = await Vehicle.deleteOne({ _id: req.body._id });
  res.status(200).json({ data: data, message: "Vehicle Deleted successfully" });
};

export const updateMany = async (req: Request, res: Response) => {
  let data: any;

  let payload: any = {};
  if (req.body.subscriptionexp)
    Object.assign(payload, {
      subscriptionexp: req.body.subscriptionexp,
    });
  if (req.body.subscriptiostart)
    Object.assign(payload, {
      subscriptiostart: req.body.subscriptiostart,
    });
  await Vehicle.updateMany({ deviceId: req.body.deviceId }, payload);

  res.status(200).json({ data: data, message: "Vehicle Deleted successfully" });
};

export const expVehicle = async (req: Request, res: Response) => {
  let data: any;

  data = await renewRequest.findOne({ deviceid: req.body.deviceid });
  if (!data) {
    data = await renewRequest.create({ ...req.body });
  } else {
    const createdAt: any = new Date(data.createdAt);
    const currentDate: any = new Date();

    const differenceInMilliseconds = currentDate - createdAt;

    if (differenceInMilliseconds > 86400000) {
      data = await renewRequest.create({ ...req.body });
    } else {
      return res
        .status(400)
        .json({
          message:
            "you have allReady make request for this device try after 24 hours",
          status: 400,
        });
    }
  }

  res.status(200).json({ data: data, message: "success", status: 200 });
};



