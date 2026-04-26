const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const db = require("../config/db");

router.use(protect);

router.get("/user/:userId", (req, res) => {
  const { userId } = req.params;
  if (parseInt(req.user.id) !== parseInt(userId)) {
    return res.status(403).json({ success: false, error: "You can only view your own performance" });
  }

  try {
    const userEmail = db.prepare("SELECT email FROM users WHERE id = ?").get(userId);
    const stats = db.prepare("SELECT COUNT(*) as total_tasks, SUM(CASE WHEN status = 'Done' THEN 1 ELSE 0 END) as completed_tasks FROM tasks WHERE assignee = ?").get(userEmail?.email);
    const totalTasks = stats?.total_tasks || 0;
    const completedTasks = stats?.completed_tasks || 0;
    res.json({ success: true, performance: { total_tasks: totalTasks, completed_tasks: completedTasks, completion_rate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0, in_progress_tasks: 0, pending_tasks: 0, overdue_tasks: 0 } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/company/analytics", (req, res) => {
  try {
    const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users").get().count;
    const totalProjects = db.prepare("SELECT COUNT(*) as count FROM projects").get().count;
    const totalTasks = db.prepare("SELECT COUNT(*) as count FROM tasks").get().count;
    const completedTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'Done'").get().count;
    res.json({ success: true, analytics: { total_users: totalUsers, total_projects: totalProjects, total_tasks: totalTasks, completed_tasks: completedTasks, overall_completion_rate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0, total_overdue_tasks: 0, topPerformers: [] } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;