import schedule from "node-schedule";
import { vehicleTrackingSchema } from "../models/tracking";
import { VehicletrackingLogsSchema } from "../models/VehicletrackingLogs";
import { model } from "mongoose";

// Define models
const tracking = model("tracking", vehicleTrackingSchema);
const VehicletrackingLogs = model("VehicletrackingLogs", VehicletrackingLogsSchema);

// Scheduler function
export const scheduleTask = () => {
  schedule.scheduleJob('0 * * * *', async () => {
    try {
      const startTime = Date.now(); // Record the start time of the task
      const date = new Date(); // Current date and time

      // Get the seconds (0 to 59)
      const seconds = date.getSeconds();
      console.log("Current Seconds:", seconds);

      // Aggregation pipeline
      const data = await tracking.aggregate([
        {
          $sort: { createdAt: -1 }, // Sort by creation date (latest first)
        },
        {
          $limit: 30000,
        },
        {
          $group: {
            _id: "$deviceID", // Group by deviceID
            records: {
              $push: {
                _id: "$_id",
                deviceID: "$deviceID",
                deviceIMEI:"$deviceIMEI",
                vehicleNo:"$vehicleNo",
                simIMEI:"$simIMEI",
                posID: "$posID",
                simMobileNumber: "$simMobileNumber",
                location: "$location",
                course: "$course",
                status: "$status",
                lastUpdateTime: "$lastUpdateTime",
                deviceFixTime: "$deviceFixTime",
                currentSpeed: "$currentSpeed",
                totalDistanceCovered: "$totalDistanceCovered",
                fuelGauge: "$fuelGauge",
                ignition: "$ignition",
                ac: "$ac",
                door: "$door",
                gps: "$gps",
                expiryDate: "$expiryDate",
                dailyDistance: "$dailyDistance",
                tripDistance: "$tripDistance",
                lastIgnitionTime: "$lastIgnitionTime",
                internalBattery: "$internalBattery",
                externalBattery:"$externalBattery",
                fuel: "$fuel",
                network: "$network",
                temperature: "$temperature",
                createdAt: "$createdAt",
              },
            },
          },
        },
        {
          $project: {      
            _id: 1,
            records: {
              $slice: ["$records", 1, { $size: "$records" }], // Skip the first record (latest one) and return the rest
            },
          },
        },
      ], { allowDiskUse: true });

      let pusharr: any[] = [];

      // Process results and prepare for insertion
      data.forEach((val: any) => {
        pusharr = [...pusharr, ...val.records];
      });

      console.log("Total records to process:", pusharr.length);

      // Batch insert records into VehicletrackingLogs
      const batchSize = 1000;
      for (let i = 0; i < pusharr.length; i += batchSize) {
        const batch = pusharr.slice(i, i + batchSize);
        try {
          await VehicletrackingLogs.insertMany(batch, { ordered: false });
          // console.log(`Inserted batch ${i / batchSize + 1} of size ${batch.length}`);
        } catch (insertErr) {
          console.error(`Error inserting batch ${i / batchSize + 1}:`, insertErr);
        }
      }

      // Collect the IDs of the inserted records
      const insertedIds = pusharr.map((record: any) => record._id);

      // Delete the records from the tracking collection that were just inserted
      const deleteResult = await tracking.deleteMany({
        _id: { $in: insertedIds }, // Match the _id of the records inserted into VehicletrackingLogs
      });

      console.log(`Deleted ${deleteResult.deletedCount} records from tracking collection.`);

      const endTime = Date.now(); // Record the end time of the task
      const executionTime = (endTime - startTime) / 1000; // Calculate execution time in seconds
      console.log(`Task executed in ${executionTime} seconds.`);
    } catch (err) {
      console.error("Error during aggregation, insertion, or deletion:", JSON.stringify(err));
    }
  });
};