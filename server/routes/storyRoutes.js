const express = require("express");
const router = express.Router();
const {
  createStory,
  getStoriesByProject,
  getStoryById,
  updateStory,
  deleteStory,
} = require("../controllers/storyController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.post("/", createStory);
router.get("/project/:projectId", getStoriesByProject);
router.get("/:id", getStoryById);
router.put("/:id", updateStory);
router.delete("/:id", deleteStory);

module.exports = router;