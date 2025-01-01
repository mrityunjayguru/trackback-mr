import mongoose, { Schema } from "mongoose";
export const renewRequestSchema = new Schema(
  {
    deviceid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserDevices",
      require: true,
    },
    requestStatus: {
      type: String,
      enum: ["Pending", "Resolved", "Rejected"],
    },
    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "renewRequest" }
);
