const express = require("express");
const router = express.Router();
const { sendOTP, verifyOTP, resendOTP } = require("../controllers/otpController");

router.post("/send", sendOTP);
router.post("/verify", verifyOTP);
router.post("/resend", resendOTP);
const otpRoutes = require("./routes/otpRoutes");

// Add this after other app.use statements
app.use("/api/otp", otpRoutes);

module.exports = router;