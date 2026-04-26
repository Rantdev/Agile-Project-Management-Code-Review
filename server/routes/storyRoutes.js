const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createStory,
  getStoriesByProject,
  getStoryById,
  updateStory,
  deleteStory,
} = require("../controllers/storyController");

// All routes require authentication
router.use(protect);

// Routes
router.get("/project/:projectId", getStoriesByProject);
router.get("/:id", getStoryById);
router.post("/", createStory);
router.put("/:id", updateStory);
router.delete("/:id", deleteStory);

module.exports = router;