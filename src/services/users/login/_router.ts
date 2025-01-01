import { Router } from "express";
import {
  forgotPassword,
  loginWithEmail,
  loginWithMobile,
  resetPassword,
  sendOtp,
  sendOtpMobile,
  signup,
  verify,
  createUser,
  updateUser,
} from "./login";
import middleware from "../../../middleware";
const router = Router();

router.post("/signup", signup);
router.post(
  "/createUser",
  middleware.FileUpload([
    {
      name: "profile",
      maxCount: 1 // Maximum number of files for this field
    },
    {
      name: "Document",
      maxCount: 1 // Maximum number of files for this field
    }
  ]),
  middleware.UploadtoCloud,        
  createUser                    
);

router.post(
  "/updateUser",
  middleware.FileUpload([
    {
      name: "profile",
      maxCount: 1 // Maximum number of files for this field
    },
    {
      name: "Document",
      maxCount: 1 // Maximum number of files for this field
    }
  ]),
  middleware.UploadtoCloud,
  updateUser
);


router.post("/verify", verify);
router.post("/login", loginWithEmail);
router.post("/login-with-mobile", loginWithMobile);
router.post("/send_otp", sendOtp);
router.post("/send_otp_mobile", sendOtpMobile);
router.post("/forgot_password", forgotPassword);
router.post("/reset_password", resetPassword);

export default router;
