const express = require("express");
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectStats,
} = require("../controllers/projectController");
const { protect } = require("../middleware/auth");

// All routes require authentication
router.use(protect);

// Project routes
router.post("/", createProject);
router.get("/", getProjects);
router.get("/stats/:id", getProjectStats);
router.get("/:id", getProjectById);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

module.exports = router;