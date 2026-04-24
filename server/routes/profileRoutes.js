const express = require("express");
const router = express.Router();
const { 
  getProfile, 
  updateProfile, 
  uploadAvatar, 
  setupUserRole,
  addSkill,
  removeSkill,
  updateSkill,
  getCommonSkills
} = require("../controllers/profileController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/:userId", getProfile);
router.put("/:userId", updateProfile);
router.post("/avatar", uploadAvatar);
router.post("/setup-role", setupUserRole);

// Skill routes
router.post("/:userId/skills", addSkill);
router.delete("/:userId/skills/:skillId", removeSkill);
router.put("/:userId/skills/:skillId", updateSkill);
router.get("/skills/common", getCommonSkills);

module.exports = router;