const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasksByStory,
  updateTask,
  deleteTask,
  getMyTasks,
} = require("../controllers/taskController");
const { protect } = require("../middleware/auth");
const { canDeleteTask, canEditTask } = require("../middleware/permissions");

router.use(protect);

router.post("/", createTask);
router.get("/my-tasks", getMyTasks);
router.get("/story/:storyId", getTasksByStory);
router.put("/:id", canEditTask, updateTask);  // Only owner or assignee can edit
router.delete("/:id", canDeleteTask, deleteTask);  // Only owner can delete

module.exports = router;