import mongoose, { Schema, model } from "mongoose";

export const vehicleDetailsSchema = new Schema(
  {
    vehicleRegistrationNo: { type: String,unique: true , default: "" },
    fuelStatus: { type: String, enum: ["off", "On"] },
    vehicleNo: { type: String,  },
    deviceId: { type: String, unique: true },
    imei: { type: String, required: true, unique: true },
    vehicleType: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "vehicleType",
    },
    dealerCode:{
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "vehicleType",
    },
    deviceType:{
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    deviceSimNumber:{
      type: String
    },
    operator:{
      type: String
    },
    Subscription: { type: Date },
    output: { type: Date },
    ownerID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    dateAdded: { type: Date, default: Date.now },
    driverName: { type: String },
    mobileNo: { type: String },
    subscriptionexp: { type: Date },
    subscriptiostart: { type: Date },
    vehicleBrand: { type: String },
    vehicleModel: { type: String },
    insuranceExpiryDate: { type: Date },
    pollutionExpiryDate: { type: Date },
    fitnessExpiryDate: { type: Date },
    nationalPermitExpiryDate: { type: Date },
    maxSpeed: { type: String,},
    parking: { type: Boolean, default: false },
    parkingSpeed: { type: Number, default: 3 },
    location: {
      longitude: { type: Number },
      latitude: { type: Number },
    },
    Area: { type: String, default: "" },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    immobiliser:{
      type: String, enum: ["Start", "Stop","Pending"],
      default:"Pending"
    },
    displayParameters:{
      AC: { type: Boolean, default: false },
      Relay: { type: Boolean, default: false },
      GPS: { type: Boolean, default: false },
      Door: { type: Boolean, default: false },
      GeoFencing: { type: Boolean, default: false },
      Network: { type: Boolean, default: false },
      Engine: { type: Boolean, default: false },
      Parking: { type: Boolean, default: false },
      Charging: { type: Boolean, default: false },
    },
   
    isDeleted: { type: Boolean, default: false },
    status: { type: String, enum: ["Active", "InActive"] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "UserDevices" }
);

vehicleDetailsSchema.index({ deviceId: 1 });
vehicleDetailsSchema.index({ ownerID: 1 });


vehicleDetailsSchema.pre("save", async function (next) {
  if (!this.id) {
    const count = await mongoose.model("UserDevices").countDocuments();
    this.id = count + 1;
  }
  next();
});

// Register the schema as a model
const UserDevices = model("UserDevices", vehicleDetailsSchema);


export default UserDevices;
