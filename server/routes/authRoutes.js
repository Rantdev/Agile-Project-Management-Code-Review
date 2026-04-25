const express = require("express");
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  googleLogin,
  checkNeedsOTP,
  checkRoleSetup
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/check-needs-otp", checkNeedsOTP);

// Protected routes
router.get("/me", protect, getMe);
router.get("/check-role-setup", protect, checkRoleSetup);

module.exports = router;