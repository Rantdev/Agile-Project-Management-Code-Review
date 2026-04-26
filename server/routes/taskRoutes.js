const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createTask,
  getTasksByStory,
  updateTask,
  deleteTask,
  getMyTasks,
} = require("../controllers/taskController");

// All routes require authentication
router.use(protect);

// Routes
router.get("/my-tasks", getMyTasks);
router.get("/story/:storyId", getTasksByStory);
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

module.exports = router;