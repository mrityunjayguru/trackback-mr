import mongoose, { Schema,model } from "mongoose";

export const suportSchema = new Schema(
  {
    id: { type: Number, unique: true },
    deviceID: {
      type: String,
      required: true,
    },
    suport: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    isDeleted: { type: Boolean, default: false },
    status: {
      type: String,
      enum:["Pending","Resolved","Rejected"],
      default:"Pending",
    },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },

    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "suport" }
);
suportSchema.pre("save", async function (next) {
  if (!this.id) {
    // Get the count of documents in the collection
    const count = await model("suport").countDocuments();
    this.id = count + 1; // Set the ID as the count + 1
  }
  next();
});