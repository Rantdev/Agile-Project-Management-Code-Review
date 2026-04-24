const express = require("express");
const router = express.Router();
const { 
  sendOTP, 
  verifyOTP, 
  resendOTP,
  checkOTPStatus,
  cleanupExpiredOTPs
} = require("../controllers/otpController");

// Public routes
router.post("/send", sendOTP);
router.post("/verify", verifyOTP);
router.post("/resend", resendOTP);

// Utility routes (for debugging/maintenance)
router.get("/status/:email", checkOTPStatus);
router.post("/cleanup", cleanupExpiredOTPs);

module.exports = router;