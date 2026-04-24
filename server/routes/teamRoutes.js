const express = require("express");
const router = express.Router();
const { addMember, getMembers, deleteMember } = require("../controllers/teamController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.post("/", addMember);  // Only owner can add
router.get("/project/:projectId", getMembers);  // Anyone in team can view
router.delete("/:id", deleteMember);  // Only owner can delete

module.exports = router;