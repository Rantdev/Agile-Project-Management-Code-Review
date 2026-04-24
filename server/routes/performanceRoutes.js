const express = require("express");
const router = express.Router();
const {
  getUserPerformance,
  getTeamPerformance,
  getProjectTimeline,
  getCompanyAnalytics,
  getUserTaskHistory
} = require("../controllers/performanceController");
const { protect } = require("../middleware/auth");

// All routes require authentication
router.use(protect);

// User performance routes
router.get("/user/:userId", getUserPerformance);
router.get("/user/:userId/history", getUserTaskHistory);

// Team/Project performance routes
router.get("/team/:projectId", getTeamPerformance);
router.get("/project/:projectId/timeline", getProjectTimeline);

// Company-wide analytics (Admin/Owner only)
router.get("/company/analytics", getCompanyAnalytics);

module.exports = router;