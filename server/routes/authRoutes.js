const express = require("express");
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  googleLogin,
  checkRoleSetup,
  changePassword
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// Public routes (no authentication required)
router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);

// Protected routes (authentication required)
router.get("/me", protect, getMe);
router.get("/check-role-setup", protect, checkRoleSetup);
router.put("/change-password", protect, changePassword);

module.exports = router;