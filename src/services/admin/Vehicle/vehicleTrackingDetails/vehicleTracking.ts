import { Request, Response } from "express";
import { tracking, Vehicleupdate, Device, users, alearts } from "./_validation";


import Helper from "../../../../helper";
import _ from "lodash";
const mongoose = require("mongoose");
// import {io,users } from "../../../socket";
// import { io,socketUser } from "../../../../socket";

export const create = async (req: Request, res: Response) => {
  try {
    let records:any = await tracking.create({
      ...req.body,
      createdAt: new Date().toISOString(),
    });
    // Send success response
    await sendPushNotification(req.body, records._id);
// console.log(users,"usersusersusers")

    res.status(200).json({ message: "Success" });
  } catch (Err) {
    // console.log(Err);
  }
};
export const get = async (req: Request, res: Response) => {
  let data: any;
  data = await tracking.find({});
  res.status(200).json({ data: data, message: "success", status: 200 });
};

export const getByVehicleID = async (req: Request, res: Response) => {
  let data: any;
  let payload = { status: "Active" };

  // Build the match payload
  if (req.body.deviceId)
    Object.assign(payload, { imei: req.body.deviceId });
  if (req.body.ownerId) {
    Object.assign(payload, {
      ownerID: new mongoose.Types.ObjectId(req.body.ownerId),
    });
  }
if(req.body.startdate){
  Object.assign(payload,{dateFiled:req.body.startdate})
}
if(req.body.enddate){
  Object.assign(payload,{dateFiled:req.body.enddate})
}
if(req.body.starttime){
  Object.assign(payload,{dateFiled:req.body.starttime})
}
if(req.body.enddimt){
  Object.assign(payload,{dateFiled:req.body.enddimt})
}
  data = await Device.aggregate([
    {
      $match: payload, // Match the device by deviceId or _id
    },
    {
      $lookup: {
        from: "Vehicletracking",
        let: { tracking: "$imei" }, // Define variable for deviceId
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$deviceIMEI", "$$tracking"] }], // Match deviceID with the tracking variable
              },
            },
          },
          {
            $sort: { createdAt: -1 },
          },
          {
            $limit: 1,
          },
        ],
        as: "trackingData",
      },
    },
    {
      $unwind: { path: "$trackingData", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "vehicleType",
        localField: "vehicleType",
        foreignField: "_id",
        as: "vehicletype",
      },
    },
    {
      $unwind: { path: "$vehicletype", preserveNullAndEmptyArrays: true },
    },
    {
      $addFields: {
        dateFiled: {
          $dateToString: {
            format: "%Y-%m-%d %H:%M:%S",
            date: "$trackingData.createdAt",
            timezone: "Asia/Kolkata", // Convert to Indian Standard Time
          },
        },
      },
    },
  ]);
  
  res.status(200).json({ data: data, message: "success", status: 200 });
};

export const rootHistory = async (req: Request, res: Response) => {
  let data: any;
  let payload = { status: "Active" };
  let datefilterpayload: any = {};
  const timefilterpayload: any = {};

  if (req.body.imei) {
    Object.assign(payload, { imei: req.body.imei });
  }
  // Build the date filter if start or end date is provided
  if (req.body.startdate) {
    Object.assign(datefilterpayload, { $gte: req.body.startdate });
  }
  if (req.body.enddate) {
    Object.assign(datefilterpayload, { $lte: req.body.enddate });
  }
  // Build the time filter if start or end time is provided
  if (req.body.starttime) {
    Object.assign(timefilterpayload, { $gte: req.body.starttime });
  }
  if (req.body.endtime) {
    Object.assign(timefilterpayload, { $lte: req.body.endtime });
  }
  // Conditional filter logic to combine date and time if both are provided
  let finalDateMatch:any = { dateFiled: datefilterpayload };
  // Query 1
  let data1 = await Device.aggregate([
    { $match: payload },
    {
      $lookup: {
        from: "Vehicletracking",
        let: { tracking: "$imei" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$deviceIMEI", "$$tracking"] },
            },
          },
        ],
        as: "trackingData",
      },
    },

    { $unwind: { path: "$trackingData", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "vehicleType",
        localField: "vehicleType",
        foreignField: "_id",
        as: "vehicletype",
      },
    },
    { $unwind: { path: "$vehicletype", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        dateFiled: {
          $dateToString: {
            format: "%Y-%m-%d %H:%M:%S",
            date: "$trackingData.createdAt",
            timezone: "Asia/Kolkata",
          },
        },
      },
    },
    {
      $match: finalDateMatch, // Match based on date and time filters
    },
    {
      $project: {
        _id:0,
        imei: 1,  
        "vehicletype.icons": 1, 
        "vehicletype.vehicleTypeName": 1, 
        "trackingData.course": 1, 
        "trackingData.ignition": 1, 
        "trackingData.location": 1, 
        "trackingData.createdAt": 1, 
        "trackingData.currentSpeed": 1, 
        dateFiled: 1, 
      },
    }
  ]);

  // Query 2
  let data2 = await Device.aggregate([
    { $match: payload },
    {
      $lookup: {
        from: "VehicletrackingLogs",
        let: { tracking: "$imei" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$deviceIMEI", "$$tracking"] },
            },
          },
        ],
        as: "trackingData",
      },
    },
    { $unwind: { path: "$trackingData", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "vehicleType",
        localField: "vehicleType",
        foreignField: "_id",
        as: "vehicletype",
      },
    },
    { $unwind: { path: "$vehicletype", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        dateFiled: {
          $dateToString: {
            format: "%Y-%m-%d %H:%M:%S",
            date: "$trackingData.createdAt",
            timezone: "Asia/Kolkata",
          },
        },
      },
    },
    {
      $match: finalDateMatch, // Match based on date and time filters
    },
    {
      $project: {
        _id:0,
        imei: 1,  
        "vehicletype.icons": 1, 
        "vehicletype.vehicleTypeName": 1, 
        "trackingData.course": 1, 
        "trackingData.ignition": 1, 
        "trackingData.location": 1, 
        "trackingData.createdAt": 1, 
        dateFiled: 1, 
      },
    }
  ]);

  data = [...data1, ...data2];
  res.status(200).json({ data: data, message: "success", status: 200 });
};





export const update = async (req: Request, res: Response) => {
  // Validate the incoming request data
  const { error } = Vehicleupdate(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  // Find the existing vehicle
  const vehicles: any = await tracking.findById(req.body._id);
  if (!vehicles) {
    return res.status(404).json({ message: "No record found." });
  }

  // Prepare the data to be updated
  const vehicleData = _.pick(req.body, [
    "vehicleRegistrationNo",
    "dateAdded",
    "name",
    "mobileNo",
    "vehicleType",
    "vehicleBrand",
    "vehicleModel",
    "insuranceExpiryDate",
    "pollutionExpiryDate",
    "fitnessExpiryDate",
    "nationalPermitExpiryDate",
  ]);

  Object.assign(vehicles, vehicleData); // Or vehicle.set(vehicleData)
  vehicles.updatedAt = new Date().toISOString(); // Optionally track when the vehicle was updated

  const updatedVehicle = await vehicles.save();

  res
    .status(200)
    .json({ data: updatedVehicle, message: "Vehicle updated successfully" });
};

export const Delete = async (req: Request, res: Response) => {
  let data: any;
  const vehicles: any = await tracking.findById(req.body._id);
  if (!vehicles) {
    return res.status(404).json({ message: "No record found." });
  }
  if (vehicles.status == false) {
    return res.status(409).json({ message: "Not Authrized to delete Record." });
  }

  data = await tracking.deleteOne({ _id: req.body._id });
  res.status(200).json({ data: data, message: "Vehicle Deleted successfully" });
};

export const searchuser = async (req: Request, res: Response) => {
  let data: any;
  const searchTerm = req.body.search || "";
  const payload: any = { role: "User" };

  try {
    data = await users.aggregate([
      {
        $match: payload,
      },
      {
        $match: {
          $or: [{ Name: { $regex: searchTerm, $options: "i" } }],
        },
      },
      {
        $project: {
          _id: 1,
          Name: "$Name", // Use $Name to project the correct field
          userID: "$_id", // Assuming userID corresponds to _id
        },
      },
    ]);

    res.status(200).json({ data: data, message: "success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const searchDevices = async (req: Request, res: Response) => {
  let data: any;
  const searchTerm = req.body.search || "";
 

  try {
    data = await Device.aggregate([
      {
        $match: {
          status:"Active",
          $or: [{ deviceId: { $regex: searchTerm, $options: "i" } },
            { imei: { $regex: searchTerm, $options: "i" } },
            { vehicleRegistrationNo: { $regex: searchTerm, $options: "i" } }
          ],
        },
      },
      {
        $project: {
          _id: 1,
          imei:1, // Use $Name to project the correct field
        },
      },
    ]);

    res.status(200).json({ data: data, message: "success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const Alerts = async (req: Request, res: Response) => {
  try {
    const payload: any = {};
    // Validate ownerId if provided
    if (req.body.ownerID && mongoose.Types.ObjectId.isValid(req.body.ownerID)) {
      Object.assign(payload, {
        ownerID: new mongoose.Types.ObjectId(req.body.ownerID),
      });
    }
    const project = {
      location: 1,
      course: 1,
      status: 1,
      currentSpeed: 1,
      externalBattery: 1,
      internalBattery: 1,
      dailyDistance: 1,
      gps: 1,
      door: 1,
      ignition: 1,
      ac: 1,
      fuelGauge: 1,
      createdAt: 1,
    };
    const projectvehicle = {
      vehicleTypeName: 1,
    };
    const vehicles: any = await Device.aggregate([
      {
        $match: payload,
      },
      {
        $project: {
          fuel: 1,
          deviceId: 1,
          ownerID: 1,
          vehicleType: 1,
          vehicleNo: 1,
          maxSpeed: 1,
          parking: 1,
          parkingSpeed: 1,
          location: 1,
          Area: 1,
        },
      },
      {
        $lookup: {
          from: "Vehicletracking",
          let: { tracking: "$deviceId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$deviceID", "$$tracking"] }],
                },
              },
            },
            {
              $sort: { createdAt: -1 },
            },
            {
              $limit: 1,
            },
            {
              $project: project,
            },
          ],
          as: "trackingData",
        },
      },
      {
        $lookup: {
          from: "vehicleType",
          let: { vehicle: "$vehicleType" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$_id", "$$vehicle"] }],
                },
              },
            },
            {
              $sort: { createdAt: -1 },
            },
            {
              $limit: 1,
            },
            {
              $project: projectvehicle,
            },
          ],
          as: "vehicleDetails",
        },
      },
      { $unwind: { path: "$trackingData", preserveNullAndEmptyArrays: true } },
      {
        $unwind: { path: "$vehicleDetails", preserveNullAndEmptyArrays: true },
      },
    ]);

    res.status(200).json({ data: vehicles, message: "success" });
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).json({
      message: "An error occurred while fetching vehicles",
      error: error,
    });
  }
};

const sendPushNotification = async (records: any, _id: any) => {
  let data: any;

  try {
    // Aggregation to get device and related user details
    data = await Device.aggregate([
      {
        $match: {
          imei: records.deviceIMEI, // Match device based on the deviceId
        },
      },
      {
        $lookup: {
          from: "users", // Lookup related user data
          localField: "ownerID", // Reference field from the Device collection
          foreignField: "_id", // Reference field from the User collection
          as: "result", // Output field for user data
        },
      },
      {
        $unwind: "$result", // Unwind the user data for easier access
      },
    ]);
    // const user = socketUser.find(user => user.userId === 'All');
    // console.log(user,"useruseruser")
    // if (user) {
    //   io.to(user.socketId).emit('message', records); // Emit message to the user's socket
    // }
    
    // If no device found
    if (data && data.length > 0) {
      let newRecords = data[0];

      // Handle Ignition Status
      if (records.ignition.status === true) {
        console.log("Ignition is on.");
      } else {
        console.log("Ignition is off. No notification sent.");
      }

      // Check Speed Limit Exceeded
      if (Number(records.currentSpeed) > Number(newRecords?.maxSpeed)) {
        const notificationPayload = {
          notification: {
            title: `Speed Limit Exceeded!`,
            body: `Your vehicle ${newRecords?.vehicleNo} is currently driving at ${records.currentSpeed} km/h, exceeding the speed limit of ${newRecords.maxSpeed} km/h. Please slow down for safety.`,

          },
          token: newRecords.result.firebaseToken, // User's Firebase token
          alertfor: "Speed",
        };
        await sendNotification(
          notificationPayload,
          newRecords.ownerID,
          records.deviceIMEI,
          _id,
          records.location,
          "Speed"
        );
      }

      // Speed Alert in Parking Zone
      if (newRecords?.parking === true && records.currentSpeed > 3) {
        const notificationPayload = {
          notification: {
            title: `Speed Alert in Parking Zone!`,
            body: `Your vehicle ${newRecords?.vehicleNo} is driving at ${records.currentSpeed} km/h in a parking zone, exceeding the allowed speed of ${newRecords.parkingSpeed} km/h. Please slow down to avoid accidents.`,

          },
          token: newRecords.result.firebaseToken,
        };
        await sendNotification(
          notificationPayload,
          newRecords.ownerID,
          records.deviceIMEI,
          _id,
          records.location,
          "parking"
        );
      }

      // Door Open Alert
      if (records.door === true) {
        const notificationPayload = {
          notification: {
            title: `Door Open!`,
            body: `Your vehicle ${newRecords?.vehicleNo} is moving at ${records.currentSpeed} km/h while the door is open. Please slow down to avoid accidents or further damage.`,
          },
          token: newRecords.result.firebaseToken,
        };
        await sendNotification(
          notificationPayload,
          newRecords.ownerID,
          records.deviceIMEI,
          _id,
          records.location,
          "door"
        );
      }

      // GPS Not Detected
      if (records.gps === false) {
        const notificationPayload = {
          notification: {
            title: `GPS Not Detected!`,
            body: `Your vehicle ${newRecords?.vehicleNo} is moving at ${records.currentSpeed} km/h. Make sure your GPS is enabled for accurate tracking.`,
          },
          token: newRecords.result.firebaseToken,
        };
        await sendNotification(
          notificationPayload,
          newRecords.ownerID,
          records.deviceIMEI,
          _id,
          records.location,
          "gps"
        );
      }

      // Network Disconnected
      if (records?.network === "Disconnected") {
        const notificationPayload = {
          notification: {
            title: `Network Alert: Disconnected!`,
            body: `Your vehicle's ${newRecords?.vehicleNo} network connection is lost. Please check your connection for accurate tracking and updates.`,
          },
          token: newRecords.result.firebaseToken,
        };
        await sendNotification(
          notificationPayload,
          newRecords.ownerID,
          records.deviceIMEI,
          _id,
          records.location,
          "Network"
        );
      }

      // AC Alert
      if (records.ac === false) {
        const notificationPayload = {
          notification: {
            title: `AC Alert: Air Conditioning Off!`,
            body: `The air conditioning in your vehicle ${newRecords?.vehicleNo} is currently off. Please turn it on for a more comfortable ride.`,

          },
          token: newRecords.result.firebaseToken,
        };
        await sendNotification(
          notificationPayload,
          newRecords.ownerID,
          records.deviceIMEI,
          _id,
          records.location,
          "ac"
        );
      }
      if (records.internalBattery < 30) {
        const notificationPayload = {
          notification: {
            title: `Low Battery Alert`,
            body: `The internal battery level of your vehicle ${newRecords?.vehicleNo} is critically low at ${records.internalBattery}%. Please charge the battery to avoid disruptions.`,

          },
          token: newRecords.result.firebaseToken,
        };
        await sendNotification(
          notificationPayload,
          newRecords.ownerID,
          records.deviceIMEI,
          _id,
          records.location,
          "Battery"
        );
      }
      // Location Out of Area
      if (newRecords?.Area) {
        const centerLat = newRecords.location?.latitude;
        const centerLon = newRecords.location?.longitude;
        const radiusInFeet = newRecords.Area; // Radius in feet
        const currentLat = records.location.latitude;
        const currentLon = records.location.longitude;

        
        const distance = haversineDistance(
          currentLat,
          currentLon,
          centerLat,
          centerLon
        );
       
        // Check if the current location is out of the radius
        if (distance > radiusInFeet) {
          const notificationPayload = {
            notification: {
              title: `Location Alert: Out of Area!`,
              body: `Your vehicle ${newRecords?.vehicleNo} has moved out of the designated area. Please return to the specified location to comply with the guidelines.`,

            },
            token: newRecords.result.firebaseToken,
          };
          await sendNotification(
            notificationPayload,
            newRecords.ownerID,
            records.deviceIMEI,
            _id,
            records.location,
            "Area"
          );
        }
      }
    } else {
      // console.log('No device found with the provided deviceId.');
    }
  } catch (err) {
    console.error("Error during aggregation:", err);
    return { status: "failed", message: "Error during aggregation" };
  }
};

// Helper function to send notification
const sendNotification = async (
  notificationPayload: any,
  ownerID: any,
  deviceID: string,
  _id: any,
  location: any,
  alertfor: string
) => {
  try {
    const notificationResult: any = await Helper.sendPushNotification(
      notificationPayload
    );

    if (notificationResult.status === "success") {
      await alearts.create({
        notificationalert: notificationPayload,
        imei: deviceID,
        status: "Success",
        alertfor,
        ownerID: ownerID,
        location,
        trackingID: _id,
      });
    } else {
      await alearts.create({
        notificationalert: notificationPayload,
        imei: deviceID,
        status: "Failed",
        alertfor,
        ownerID: ownerID,
        location,
        trackingID: _id,
      });
    }
  } catch (error) {
    console.error("Error sending notification:", error);
    await alearts.create({
      notificationalert: notificationPayload,
      imei: deviceID,
      status: "Failed",
      alertfor,
    });
  }
};

const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 3958.8; // Earth radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceInMiles = R * c; // Distance in miles

  return distanceInMiles * 5280; // Convert miles to feet
};

