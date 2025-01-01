import { Schema,model } from "mongoose";
import config from "config";
import { encrypt } from "../helper/encription";
import jwt from "jsonwebtoken";
export const usersSchema = new Schema(
  {
    id: { type: Number, unique: true },

    Name: { type: String },
    contactPerson:{type: String },
    PersonDesignation:{type: String},
    uniqueCode: { type: String,unique: false },
    emailAddress: { type: String, default: ""},
    phone: { type: String,  unique: true, default: "" },
    password: { type: String, required: [true, "Password required"] },
    dob: { type: Date, default: "" },
    gender: { type: String, default: "" },
    address:{type:String,default: ""},
    country:{type:String,default: ""},
    state:{type:String,default: ""},
    city:{type:String,default: ""},
    pinCode:{type:String,default: ""},
    companyId:{type:String,default: ""},
    idno:{type:String,default: ""},
    firebaseToken:{type:String,default: ""},
    notification:{type:Boolean,default:true},
    permissions: {
      Subscribers: {  
        Add: { type: Boolean, default: false },
        Update: { type: Boolean, default: false },
        View: { type: Boolean, default: false },
      },
      Map: {
        Add: { type: Boolean, default: false },
        Update: { type: Boolean, default: false },
        View: { type: Boolean, default: false },
      },
      Notification: {
        Add: { type: Boolean, default: false },
        Update: { type: Boolean, default: false },
        View: { type: Boolean, default: false },
      },
      Support: {  
        Add: { type: Boolean, default: false },
        Update: { type: Boolean, default: false },
        View: { type: Boolean, default: false },
      },
      Device: {  
        Add: { type: Boolean, default: false },
        Update: { type: Boolean, default: false },
        View: { type: Boolean, default: false },
      },
      Admin: {
        Add: { type: Boolean, default: false },
        Update: { type: Boolean, default: false },
        View: { type: Boolean, default: false },
      },
      Settings: {
        Add: { type: Boolean, default: false },
        Update: { type: Boolean, default: false },
        View: { type: Boolean, default: false },
      },
      FAQTopics: {
        Add: { type: Boolean, default: false },
        Update: { type: Boolean, default: false },
        View: { type: Boolean, default: false },
      },
      FAQ: { 
        Add: { type: Boolean, default: false },
        Update: { type: Boolean, default: false },
        View: { type: Boolean, default: false },
      },
      Vehicle: {
        Add: { type: Boolean, default: false },
        Update: { type: Boolean, default: false },
        View: { type: Boolean, default: false },
      },
      Splash: {
        Add: { type: Boolean, default: false },
        Update: { type: Boolean, default: false },
        View: { type: Boolean, default: false },
      },
    },
    
    profile: { type: String, default: "" },
    idDocument: { type: String, default: "" },
    Document: { type: String, default: "" },
    profileId: { type: String, default: "" },
    otp: { type: Number, default: "" },
    role: { type: String, enum: ["User", "Admin","SuperAdmin"], default: "User" },
    subscribeType: { type: String, enum: ["Individual", "Company","Dealer"]},
    token: { type: String, default: "" },
    status: { type: Boolean, default: true },
    createdAt: { type: Date, default: new Date().toISOString() },
    updatedAt: { type: Date, default: new Date().toISOString() },
  },
  { collection: "users" }
);
usersSchema.methods.getAccessToken = function () {
  const token = jwt.sign(
    { uid: this._id },
    config.get("jwtPrivateKey")
  );
  return encrypt(token);
};

usersSchema.pre("save", async function (next) {
  if (!this.id) {
    // Get the count of documents in the collection
    const count = await model("users").countDocuments();
    this.id = count + 1; // Set the ID as the count + 1
  }
  next();
});

usersSchema.pre("save", async function (next) {
  // Ensure the user ID is unique
  if (!this.id) {
    const count = await model("users").countDocuments();
    this.id = count + 1; // Set the ID as the count + 1
  }

  // Ensure the uniqueCode is based on the subscriber type
  if (!this.uniqueCode) {
    let prefix = 'TRP'; // Default prefix for 'Individual' and 'Company'
    const subscriberType = this.subscribeType || 'User'; // Default to 'User' if no subscriberType is provided

    // If the subscriber type is 'Dealer', use 'TRPD' as the prefix
    if (subscriberType === 'Dealer') {
      prefix = 'TRPD';
    }

    // Get the count of users for the same subscriberType
    const count = await model("users").countDocuments({ subscribeType: subscriberType });

    // Generate the unique code based on the count
    const formattedCount = (count + 1).toString().padStart(5, '0'); // Ensure the number is padded to 5 digits
    this.uniqueCode = `${prefix}${formattedCount}`;
  }

  next();
});
