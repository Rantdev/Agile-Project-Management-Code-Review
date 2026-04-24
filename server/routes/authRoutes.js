const express = require("express");
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  googleLogin,
  updateProfile,
  changePassword,
  deleteAccount,
  checkRoleSetup,
  checkNeedsOTP
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// Public routes (no authentication required)
router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/check-needs-otp", checkNeedsOTP);

// Protected routes (authentication required)
router.get("/me", protect, getMe);
router.get("/check-role-setup", protect, checkRoleSetup);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.delete("/account", protect, deleteAccount);

module.exports = router;