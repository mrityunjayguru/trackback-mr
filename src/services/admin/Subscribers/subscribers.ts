import { Request, Response } from "express";
import { subscriber } from "./_validation"; // Adjust the import path according to your project structure

export const getSubscribers = async (req: Request, res: Response) => {
  try {
    const searchTerm = req.body.search || ""; // Default to empty string if no search term provided
    const limit = req.body.limit || 10; // Get limit from request or default to 10
    const offset = req.body.offset || 0; // Get offset from request or default to 0
const filters=req.body.filter || ""
const filterpayload={}
if(req.body.filter)
  Object.assign(filterpayload,{subscribeType:filters})

    // First, get the total count of matching records
    const totalCount = await subscriber.countDocuments({
      role: "User", // Ensure the role is "User"
      subscribeType: { $in: ["Individual", "Company","Dealer"] }, // Filter subscribeType as Individual or Company
      $or: [
        { "Name": { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on Name
        { "emailAddress": { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on emailAddress
        { "phone": { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on phone
        { "subscribeType": { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on subscribeType
      ],
      ...filterpayload, // Spread the additional filter payload here
    });
    

    // Now, perform the aggregation to get the actual data
    const data = await subscriber.aggregate([
      {
        $match: {
          role: "User",
          subscribeType: { $in: ["Individual", "Company","Dealer"] },
          $or: [
            { "Name": { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on Name
            { "emailAddress": { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on emailAddress
            { "phone": { $regex: searchTerm, $options: "i" } },
            { "subscribeType": { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on subscribeType
          ],
        },
      },
      {   
        $match:filterpayload
      },
      {
        $lookup: {
          from: "UserDevices",
          let: { subscriberId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$ownerID", "$$subscriberId"] },
                  ],
                },
              },
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
              $lookup: {
                from: "users",
                localField: "dealerCode",
                foreignField: "_id",
                as: "dealerdetail",
              },
            },
            {
              $unwind: {
                path: "$dealerdetail",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $unwind: {
                path: "$vehicleTypeDetails",
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: "userDevices",
        },
      },
      {
        $sort: { updatedAt: -1 }, // Sort by createdAt in descending order to get the latest first
      },
      {
        $skip: offset, // Skip the number of documents specified by offset
      },
      {
        $limit: limit, // Limit the number of documents returned
      },
    ]);

    // Send response with data and total count
    res.status(200).json({ data, totalCount, message: "success" });
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const groupSubescriber = async (req: Request, res: Response) => {
  const necessary = {
    // {
    // $project: {
    id:1,
    _id: 1,
    Name: 1,
    uniqueID: 1,
    emailAddress: 1,
    phone: 1,
    dob: 1,
    gender: 1,
    address: 1,
    country: 1,
    state: 1,
    city: 1,
    pinCode: 1,
    companyId: 1,
    profile: 1,
    profileId: 1,
    role: 1,
    subscribeType: 1,
    status: 1,
    createdAt: 1,
    updatedAt: 1,
    userDevices: 1,
    password:1,
    // },
    // },
  }

  try {
    const Individual = await subscriber.aggregate([
      {
        $match: {
          role: "User",
          subscribeType: "Individual"

        },
      },
    // {
    //   $match: {
    //     createdAt: {
    //         $gte: { $dateSubtract: { startDate: new Date(), unit: "day", amount: 30 } }
    //     }
    // }
    // },
      {
        $lookup: {
          from: "UserDevices",
          let: { subscriberId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$ownerID", "$$subscriberId"] }, // Match UserDevices' subscriberId with subscriber's _id
                  ],
                },
              },
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
              $unwind: {
                path: "$vehicleTypeDetails",
              },
            },
          ],
          as: "userDevices",
        },
      },
      {
        $project: necessary
      },
      {
        $sort: { updatedAt: -1 }, // Sort by createdAt in descending order to get the latest first
      },{
        $limit:10
      }
    ]);
    const Company = await subscriber.aggregate([
      {
        $match: {
          role: "User",
          subscribeType: "Company"

        },
      },
      {
        $lookup: {
          from: "UserDevices",
          let: { subscriberId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$ownerID", "$$subscriberId"] },
                  ],
                },
              },
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
              $unwind: {
                path: "$vehicleTypeDetails",
              },
            },
          ],
          as: "userDevices",
        },
      },
      {
        $project: necessary
      },
      {
        $sort: { updatedAt: -1 }, // Sort by createdAt in descending order to get the latest first
      },
      {
        $limit:10
      }
    ]);

    res.status(200).json({ data: { Individual, Company }, message: "success" });
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};






