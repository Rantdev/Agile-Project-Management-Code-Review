const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const db = require("../config/db");

router.use(protect);

// Get user performance
router.get("/user/:userId", (req, res) => {
  try {
    const userEmail = db.prepare(`SELECT email FROM users WHERE id = ?`).get(req.params.userId);
    
    if (!userEmail) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'Done' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress_tasks,
        SUM(CASE WHEN status = 'To Do' THEN 1 ELSE 0 END) as pending_tasks
      FROM tasks WHERE assignee = ?
    `).get(userEmail.email);
    
    const totalTasks = stats?.total_tasks || 0;
    const completedTasks = stats?.completed_tasks || 0;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    res.json({ 
      success: true, 
      performance: {
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        in_progress_tasks: stats?.in_progress_tasks || 0,
        pending_tasks: stats?.pending_tasks || 0,
        completion_rate: completionRate,
        overdue_tasks: 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get company analytics
router.get("/company/analytics", (req, res) => {
  try {
    const totalUsers = db.prepare(`SELECT COUNT(*) as count FROM users`).get().count;
    const totalProjects = db.prepare(`SELECT COUNT(*) as count FROM projects`).get().count;
    const totalTasks = db.prepare(`SELECT COUNT(*) as count FROM tasks`).get().count;
    const completedTasks = db.prepare(`SELECT COUNT(*) as count FROM tasks WHERE status = 'Done'`).get().count;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const topPerformers = db.prepare(`
      SELECT u.name, u.email, COUNT(t.id) as completed_tasks
      FROM users u
      JOIN tasks t ON t.assignee = u.email
      WHERE t.status = 'Done'
      GROUP BY u.id
      ORDER BY completed_tasks DESC
      LIMIT 5
    `).all();
    
    res.json({ 
      success: true, 
      analytics: {
        total_users: totalUsers,
        total_projects: totalProjects,
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        overall_completion_rate: completionRate,
        total_overdue_tasks: 0,
        topPerformers: topPerformers || []
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;