import { Request, Response } from "express";
import {
  User,
  validateEmail,
  validateLogin,
  validateLoginWithMobile,
  validateSignup,
  validateVerify,
  Vehicle
} from "./_validation";
import { decrypt, encrypt } from "../../../helper/encription";
import _ from "lodash";
import helper from "../../../helper";
export const signup = async (req: Request, res: Response) => {
  const { error } = validateSignup(req.body);
  if (error) throw error;
  let Existuser: any = await User.findOne({
    emailAddress: req.body.emailAddress,
  });
  if (Existuser)
    return res
      .status(400)
      .json({ emailAddress: "Email Address is already exist." });

  let payload: any = _.pick(req.body, [
    "firstName",
    "lastName",
    "emailAddress",
    "mobileNumber",
    "gender",
  ]);
  payload.password = await encrypt(req.body.password);

  let newUser: any = new User(payload);
  newUser.createdAt = new Date().toISOString();
  newUser.updatedAt = new Date().toISOString();

  let existingUser: any = await User.findOne({
    emailAddress: req.body.emailAddress,
  });
  if (existingUser) {
    existingUser.verificationCode = newUser.verificationCode;
    existingUser.updatedAt = new Date().toISOString();
    existingUser = await existingUser.save();
  } else {
    newUser = await newUser.save();
  }
  const token: any = await newUser.getAccessToken();

  res
    .status(200)
    .setHeader("x-auth-token", token)
    .status(200)
    .json({ data: existingUser, token: token, message: "Signup Successfully" });
};

export const verify = async (req: Request, res: Response) => {
  try {
    const { error } = validateVerify(req.body);
    if (error)
      return res.status(400).json({ message: error.message, status: 400 });

    let user: any = await User.findOne({
      emailAddress: req.body.emailAddress,
    });

    if (!user) {
      return res.status(400).json({
        message: "Verification Code not matched or invalid.",
        status: 400,
      });
    }
    if (user.otp != req.body.otp) {
      return res.status(400).json({
        message: "OTP is incorrect.",
        status: 400,
      });
    }
    const currentTime = new Date().getTime();
    const otpGenerationTime = new Date(user.updatedAt).getTime();
    const timeDifference = currentTime - otpGenerationTime;

    if (timeDifference > 60000) {
      return res.status(410).json({
        message: "OTP has expired. Please request a new OTP.",
        status: 410,
      });
    }
    res
      .status(200)
      .json({ message: "User verified successfully.", status: 200 });
  } catch (err) {
    console.error("Error verifying user:", err);
    res.status(500).json({ message: "Server error", status: 500 });
  }
};

export const loginWithEmail = async (req: Request, res: Response) => {
  const { error } = validateLogin(req.body);
  if (error) throw error;

  let Users: any = await User.findOne({
    emailAddress: req.body.emailAddress,
  });
  // console.log(Users,"UsersUsersUsers")
  if (!Users)
    return res.status(403).json({
      message: "Invalid emailAddress or password! Please try again.",
      status: 403,
    });
  if (Users.status === "pending")
    return res
      .status(400)
      .json({ message: "Email Address not verified.", status: 400 });
  if (Users.status === false)
    return res.status(400).json({
      message: "Your account has been blocked! Please contact admin.",
      status: 400,
    });
  let password: string = await decrypt(Users.password);
  if (req.body.password != password)
    return res.status(400).json({
      message: "Invalid email or password! Please try again.",
      status: 400,
    });

  // const token: any = await Users.getAccessToken();
  const token: any = await Users.getAccessToken();
  await User.updateOne({ _id: Users._id }, { $set: { token: token } });
  const userDetails: any = {
    Name: Users.Name,
    emailAddress: Users.emailAddress,
    _id: Users._id,
    phone: Users.phone,
    role: Users.role,
    permissions: Users.permissions,
    status: Users.status,
    profile: Users.profile,
    subscribeType: Users.subscribeType ? Users.subscribeType : "",
    createdAt: new Date(Users.createdAt).toLocaleDateString(),
    updatedAt: new Date(Users.updatedAt).toLocaleDateString(),
  };
  res
    .status(200)
    .setHeader("x-auth-token", token)
    .json({ data: userDetails, token: token, message: "success", status: 200 });
};

export const loginWithMobile = async (req: Request, res: Response) => {
  const { error } = validateLoginWithMobile(req.body);
  if (error) throw error;

  let Users: any = await User.findOne({
    mobileNumber: req.body.mobileNumber,
  });
  if (!Users)
    return res.status(400).json({
      message: "Invalid mobile number or otp! Please try again.",
      status: 400,
    });

  if (req.body.verificationCode != Users.verificationCode)
    return res.status(400).json({
      message: "Invalid mobile number or otp! Please try again.",
      status: 400,
    });

    const token: any = await Users.getAccessToken();  // Fetch token
    let datass=await User.updateOne(
      { _id: Users._id },  // Ensure this is the correct user ID
      { $set: { token: token } }  // Use $set to update the token field
    );
    console.log(datass,"datassdatass")
  res
    .status(200)
    .setHeader("x-auth-token", token)
    .json({ token: token, message: "success", status: 200 });
};
export const forgotPassword = async (req: Request, res: Response) => {
  // Validate email input
  // const { error } = validateEmail(req.body);
  // if (error) {
  //   return res.status(400).json({ message: "Invalid email format.", status: 400 });
  // }

  // Find the user by email address
  let user:any = await User.findOne({
    emailAddress: req.body.emailAddress,
  });

  if (!user) {
    return res.status(400).json({
      message: "Invalid email address! Please try again.",
      status: 400,
    });
  }

  // Encrypt the new password
  const oldpassword: string = await decrypt(user.password);

  if (oldpassword != req.body.password) {
    return res.status(400).json({
      message: "password not match.",
      status: 401,
    });
  }
  // Update user with the new password and set a verification code
  user.password = await encrypt(req.body.newpassword);

  // Save updated user data
  try {
    await user.save();
    return res.status(200).json({
      message: "Password reset successful. Please use your new password.",
      status: 200,
    });
  } catch (error) {
    console.error("Error saving updated user:", error);
    return res.status(500).json({
      message: "Internal server error while updating password.",
      status: 500,
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  // const { error } = validateResetPassword(req.body);
  // if (error) throw error;

  let Users: any = await User.findOne({
    emailAddress: req.body.emailAddress,
  });
  console.log(Users,"UsersUsers")
  if (!Users)
    return res
      .status(400)
      .json({ message: "EmailAddress not found..", status: 400 });
  if (Users.otp != req.body.otp) {
    return res.status(400).json({
      message: "OTP is incorrect.",
      status: 400,
    });
  }
  const currentTime = new Date().getTime();
  const otpGenerationTime = new Date(Users.updatedAt).getTime();
  const timeDifference = currentTime - otpGenerationTime;
  if (timeDifference > 60000) {
    return res.status(410).json({
      message: "OTP has expired. Please request a new OTP.",
      status: 410,
    });
  }
  let password: string = await encrypt(req.body.password);
  Users.password = password;
  Users = await Users.save();
  res.status(200).json({ message: "Success", status: 200 });
};

export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { error } = validateEmail(req.body);
    if (error)
      return res.status(400).json({ message: error.message, status: 400 });
    let user: any = await User.findOne({ emailAddress: req.body.emailAddress });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Email Address! Please try again.",
        status: 400,
      });
    }

    const generateOtp = await helper.generateOTP();
    const payload = {
      otp: generateOtp,
      updatedAt: new Date().toISOString(),
    };
    await User.updateOne(
      { emailAddress: req.body.emailAddress },
      { $set: payload }
    );

    res.status(200).json({ otp: generateOtp, message: "success", status: 200 });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ message: "Server error", status: 500 });
  }
};

export const sendOtpMobile = async (req: Request, res: Response) => {
  // const { error } = validateMobile(req.body);
  // if (error) throw error;

  let Users: any = await User.findOne({
    mobileNumber: req.body.mobileNumber,
  });
  if (!Users)
    return res.status(400).json({
      message: "Invalid Mobile Number! Please try again.",
      status: 400,
    });

  Users.verificationCode = 523322;
  Users.updatedAt = new Date().toISOString();
  Users = await Users.save();
  res.status(200).json({ message: "OTP sent successfully.", status: 200 });
};


export const createUser = async (req: Request, res: Response) => {
  const { emailAddress, phone, idno, uniqueID, deviceId, imei, vehicleNo, password, profile, deviceStatus, displayParameters,vehicleType } = req.body;

  try {
    // Check if user exists based on email, phone, or uniqueID
    const existingUser:any = await User.findOne({
      $or: [{ emailAddress }, { phone }, { idno }],
    });

    if (existingUser) {
      if (existingUser.emailAddress === emailAddress) return res.status(400).json({ message: "Email Already Exists." });
      if (existingUser.phone === phone) return res.status(400).json({ message: "Mobile No Already Exists." });
      if (existingUser.uniqueID === uniqueID) return res.status(400).json({ message: "Unique ID Already Exists." });
      if (existingUser.idno === idno) return res.status(400).json({ message: "ID Proof No Already Exists." });
    }

    // Check if device exists based on deviceId, imei, or vehicleNo
    if(req.body.subscribeType!="Dealer"){
      const existingDevice:any = await Vehicle.findOne({
        $or: [{ deviceId }, { imei }],
      });
  
      if (existingDevice) {
        if (existingDevice.deviceId === deviceId) return res.status(400).json({ message: "Device ID Already Exists." });
        if (existingDevice.imei === imei) return res.status(400).json({ message: "IMEI Already Exists." });
        if (existingDevice.vehicleNo === vehicleNo) return res.status(400).json({ message: "Vehicle No Already Exists." });
      }
    }
    

    // Encrypt password
    const encryptedPassword = await encrypt(password);

    // Create the user
    const newUser:any = await User.create({
    ...req.body,
      profileId: profile,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      password: encryptedPassword,
    });

    // Create the associated vehicle
    if(req.body.subscribeType!="Dealer"){
      await Vehicle.create({
        ...req.body,
        deviceId,
        imei,
        vehicleNo,
        vehicleType:vehicleType,
        ownerID: newUser._id,
        displayParameters: Object.fromEntries(
          Object.entries(displayParameters).map(([key, value]) => [key, value === 'true'])
        ),
        status: deviceStatus,
        createdAt: new Date().toISOString(),
      });
    }
  

    res.status(200).json({ message: "Success", user: newUser });

  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



export const updateUser = async (req: Request, res: Response) => {
  let data: any;
  try {
    const mongoose = require("mongoose");
    const payload: any = {};
    const userId = new mongoose.Types.ObjectId(req.body._id);

    if (!userId) {
      return res.status(400).json({ message: "Please Fill Necessary Details" });
    }

    // Check uniqueness of phone, email, and idno if they are being updated
    if (req.body.phone) {
      const existingPhoneUser = await User.findOne({
        phone: req.body.phone,
        _id: { $ne: userId }, // Exclude the current user from the check
      });
      if (existingPhoneUser) {
        return res
          .status(400)
          .json({ message: "Phone number is already in use." });
      }
      payload.phone = req.body.phone;
    }

    if (req.body.emailAddress) {
      const existingEmailUser = await User.findOne({
        emailAddress: req.body.emailAddress,
        _id: { $ne: userId },
      });
      if (existingEmailUser) {
        return res
          .status(400)
          .json({ message: "Email address is already in use." });
      }
      payload.emailAddress = req.body.emailAddress;
    }

    if (req.body.idno) {
      const existingIdUser = await User.findOne({
        idno: req.body.idno,
        _id: { $ne: userId },
      });
      if (existingIdUser) {
        return res.status(400).json({ message: "Id Proof No is already in use." });
      }
      payload.idno = req.body.idno;
    }

    // Assign other fields to the payload if they exist in the request body
    Object.assign(payload, { updatedAt: new Date() });
    if (req.body.Name) payload.Name = req.body.Name;
    if (req.body.uniqueID) payload.uniqueID = req.body.uniqueID;
    if (req.body.password) payload.password = await encrypt(req.body.password);
    if (req.body.dob) payload.dob = req.body.dob;
    if (req.body.gender) payload.gender = req.body.gender;
    if (req.body.address) payload.address = req.body.address;
    if (req.body.country) payload.country = req.body.country;
    if (req.body.state) payload.state = req.body.state;
    if (req.body.city) payload.city = req.body.city;
    if (req.body.pinCode) payload.pinCode = req.body.pinCode;
    if (req.body.companyId) payload.companyId = req.body.companyId;
    if (req.body.profile) payload.profile = req.body.profile;
    if (req.body.profileId) payload.profileId = req.body.profileId;
    if (req.body.idDocument) payload.idDocument = req.body.idDocument;
    if (req.body.role) payload.role = req.body.role;
    if (req.body.notification === true || req.body.notification === false)
      payload.notification = req.body.notification;
    if (req.body.firebaseToken) payload.firebaseToken = req.body.firebaseToken;
    if (req.body.permissions) payload.permissions = req.body.permissions;
    if (req.body.subscripeType) payload.subscripeType = req.body.subscripeType;
    if (req.body.status) {
      payload.status = req.body.status;
    }
    if (req.body.Document) payload.Document = req.body.Document;
    // Update the user record
        await User.updateOne({ _id: userId }, { $set: payload });
           data=await User.findOne({_id:userId})
    res.status(200).json({ data: data, message: "success" });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
