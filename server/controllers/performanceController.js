const db = require("../config/db");

// @desc    Get user performance metrics
// @route   GET /api/performance/user/:userId
exports.getUserPerformance = (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user.id;

  console.log(`📊 Fetching performance for user: ${userId}`);

  // Check if user has access (admin or self)
  if (currentUserId != userId) {
    return res.status(403).json({ 
      success: false, 
      error: "You don't have permission to view this user's performance" 
    });
  }

  const query = `
    SELECT 
      u.id,
      u.name,
      u.email,
      COUNT(DISTINCT t.id) as total_tasks,
      COUNT(DISTINCT CASE WHEN t.status = 'Done' THEN t.id END) as completed_tasks,
      COUNT(DISTINCT CASE WHEN t.status = 'In Progress' THEN t.id END) as in_progress_tasks,
      COUNT(DISTINCT CASE WHEN t.status = 'To Do' THEN t.id END) as pending_tasks,
      ROUND(CAST(COUNT(DISTINCT CASE WHEN t.status = 'Done' THEN t.id END) AS FLOAT) / 
            NULLIF(COUNT(DISTINCT t.id), 0) * 100, 2) as completion_rate,
      COUNT(DISTINCT CASE 
        WHEN t.deadline IS NOT NULL 
        AND t.status != 'Done' 
        AND date(t.deadline) < date('now') 
        THEN t.id 
      END) as overdue_tasks,
      ROUND(AVG(CASE 
        WHEN t.status = 'Done' AND t.updated_at IS NOT NULL 
        THEN julianday(t.updated_at) - julianday(t.created_at) 
        ELSE NULL 
      END), 2) as avg_task_completion_days,
      COUNT(DISTINCT s.id) as total_stories_contributed,
      COUNT(DISTINCT p.id) as total_projects_involved
    FROM users u
    LEFT JOIN tasks t ON t.assignee = u.email
    LEFT JOIN stories s ON s.id = t.story_id
    LEFT JOIN projects p ON p.id = s.project_id
    WHERE u.id = ?
    GROUP BY u.id
  `;

  db.get(query, [userId], (err, performance) => {
    if (err) {
      console.error("❌ Database error:", err.message);
      return res.status(500).json({ success: false, error: err.message });
    }

    res.json({ 
      success: true, 
      performance: performance || {
        total_tasks: 0,
        completed_tasks: 0,
        in_progress_tasks: 0,
        pending_tasks: 0,
        completion_rate: 0,
        overdue_tasks: 0,
        avg_task_completion_days: 0,
        total_stories_contributed: 0,
        total_projects_involved: 0
      }
    });
  });
};

// @desc    Get team performance metrics
// @route   GET /api/performance/team/:projectId
exports.getTeamPerformance = (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;

  console.log(`📊 Fetching team performance for project: ${projectId}`);

  // Check if user has access to project
  db.get(
    `SELECT id FROM projects 
     WHERE id = ? AND (created_by = ? OR id IN (
       SELECT project_id FROM team_members WHERE project_id = ? AND user_email = ?
     ))`,
    [projectId, userId, projectId, req.user.email],
    (err, project) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      if (!project) {
        return res.status(403).json({ 
          success: false, 
          error: "You don't have access to this project" 
        });
      }

      // Team overview metrics
      const teamOverviewQuery = `
        SELECT 
          p.id,
          p.title as project_name,
          p.status as project_status,
          COUNT(DISTINCT tm.user_email) as total_members,
          COUNT(DISTINCT s.id) as total_stories,
          COUNT(DISTINCT t.id) as total_tasks,
          COUNT(DISTINCT CASE WHEN t.status = 'Done' THEN t.id END) as completed_tasks,
          ROUND(CAST(COUNT(DISTINCT CASE WHEN t.status = 'Done' THEN t.id END) AS FLOAT) / 
                NULLIF(COUNT(DISTINCT t.id), 0) * 100, 2) as project_completion_rate,
          COUNT(DISTINCT CASE 
            WHEN t.deadline IS NOT NULL 
            AND t.status != 'Done' 
            AND date(t.deadline) < date('now') 
            THEN t.id 
          END) as overdue_tasks,
          strftime('%Y-%m', p.created_at) as project_start_month
        FROM projects p
        LEFT JOIN team_members tm ON p.id = tm.project_id
        LEFT JOIN stories s ON p.id = s.project_id
        LEFT JOIN tasks t ON s.id = t.story_id
        WHERE p.id = ?
        GROUP BY p.id
      `;

      db.get(teamOverviewQuery, [projectId], (err, overview) => {
        if (err) {
          return res.status(500).json({ success: false, error: err.message });
        }

        // Individual team member performance
        const memberPerformanceQuery = `
          SELECT 
            tm.user_email,
            u.name,
            tm.role,
            COUNT(DISTINCT t.id) as assigned_tasks,
            COUNT(DISTINCT CASE WHEN t.status = 'Done' THEN t.id END) as completed_tasks,
            ROUND(CAST(COUNT(DISTINCT CASE WHEN t.status = 'Done' THEN t.id END) AS FLOAT) / 
                  NULLIF(COUNT(DISTINCT t.id), 0) * 100, 2) as completion_rate,
            COUNT(DISTINCT CASE 
              WHEN t.deadline IS NOT NULL 
              AND t.status != 'Done' 
              AND date(t.deadline) < date('now') 
              THEN t.id 
            END) as overdue_tasks,
            ROUND(AVG(CASE 
              WHEN t.status = 'Done' AND t.updated_at IS NOT NULL 
              THEN julianday(t.updated_at) - julianday(t.created_at) 
              ELSE NULL 
            END), 2) as avg_days_to_complete
          FROM team_members tm
          LEFT JOIN users u ON tm.user_email = u.email
          LEFT JOIN stories s ON s.project_id = tm.project_id
          LEFT JOIN tasks t ON t.story_id = s.id AND t.assignee = tm.user_email
          WHERE tm.project_id = ?
          GROUP BY tm.user_email
          ORDER BY completion_rate DESC
        `;

        db.all(memberPerformanceQuery, [projectId], (err, members) => {
          if (err) {
            return res.status(500).json({ success: false, error: err.message });
          }

          res.json({ 
            success: true, 
            teamPerformance: {
              overview: overview || {
                total_members: 0,
                total_stories: 0,
                total_tasks: 0,
                completed_tasks: 0,
                project_completion_rate: 0,
                overdue_tasks: 0
              },
              members: members || []
            }
          });
        });
      });
    }
  );
};

// @desc    Get project progress over time
// @route   GET /api/performance/project/:projectId/timeline
exports.getProjectTimeline = (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;

  console.log(`📊 Fetching timeline for project: ${projectId}`);

  db.get(
    `SELECT created_by FROM projects WHERE id = ?`,
    [projectId],
    (err, project) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      if (!project) {
        return res.status(404).json({ success: false, error: "Project not found" });
      }

      const query = `
        SELECT 
          date(t.created_at) as date,
          COUNT(DISTINCT t.id) as tasks_created,
          COUNT(DISTINCT CASE WHEN t.status = 'Done' THEN t.id END) as tasks_completed,
          strftime('%Y-%m', t.created_at) as month
        FROM tasks t
        JOIN stories s ON t.story_id = s.id
        WHERE s.project_id = ?
        GROUP BY date(t.created_at)
        ORDER BY date(t.created_at) ASC
      `;

      db.all(query, [projectId], (err, timeline) => {
        if (err) {
          return res.status(500).json({ success: false, error: err.message });
        }

        res.json({ success: true, timeline: timeline || [] });
      });
    }
  );
};

// @desc    Get company-wide analytics
// @route   GET /api/performance/company/analytics
exports.getCompanyAnalytics = (req, res) => {
  const userId = req.user.id;

  console.log(`📊 Fetching company analytics`);

  const analyticsQuery = `
    SELECT 
      (SELECT COUNT(*) FROM users) as total_users,
      (SELECT COUNT(*) FROM projects) as total_projects,
      (SELECT COUNT(*) FROM stories) as total_stories,
      (SELECT COUNT(*) FROM tasks) as total_tasks,
      (SELECT COUNT(*) FROM tasks WHERE status = 'Done') as completed_tasks,
      ROUND(CAST((SELECT COUNT(*) FROM tasks WHERE status = 'Done') AS FLOAT) / 
            NULLIF((SELECT COUNT(*) FROM tasks), 0) * 100, 2) as overall_completion_rate,
      (SELECT COUNT(*) FROM tasks 
       WHERE deadline IS NOT NULL 
       AND status != 'Done' 
       AND date(deadline) < date('now')) as total_overdue_tasks,
      (SELECT ROUND(AVG(task_count), 2) FROM (
        SELECT COUNT(*) as task_count FROM tasks GROUP BY assignee
      )) as avg_tasks_per_user
  `;

  db.get(analyticsQuery, (err, analytics) => {
    if (err) {
      console.error("❌ Database error:", err.message);
      return res.status(500).json({ success: false, error: err.message });
    }

    // Top performers
    const topPerformersQuery = `
      SELECT 
        u.name,
        u.email,
        COUNT(DISTINCT t.id) as total_tasks,
        COUNT(DISTINCT CASE WHEN t.status = 'Done' THEN t.id END) as completed_tasks,
        ROUND(CAST(COUNT(DISTINCT CASE WHEN t.status = 'Done' THEN t.id END) AS FLOAT) / 
              NULLIF(COUNT(DISTINCT t.id), 0) * 100, 2) as completion_rate,
        COUNT(DISTINCT p.id) as projects_worked_on
      FROM users u
      LEFT JOIN tasks t ON t.assignee = u.email
      LEFT JOIN stories s ON t.story_id = s.id
      LEFT JOIN projects p ON s.project_id = p.id
      WHERE t.id IS NOT NULL
      GROUP BY u.id
      HAVING total_tasks > 0
      ORDER BY completion_rate DESC, completed_tasks DESC
      LIMIT 10
    `;

    db.all(topPerformersQuery, (err, topPerformers) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }

      // Weekly activity trend
      const weeklyTrendQuery = `
        SELECT 
          strftime('%W', created_at) as week,
          strftime('%Y', created_at) as year,
          COUNT(*) as tasks_created,
          COUNT(CASE WHEN status = 'Done' THEN 1 END) as tasks_completed
        FROM tasks
        WHERE created_at >= date('now', '-30 days')
        GROUP BY strftime('%W', created_at), strftime('%Y', created_at)
        ORDER BY year DESC, week DESC
        LIMIT 4
      `;

      db.all(weeklyTrendQuery, (err, weeklyTrend) => {
        if (err) {
          return res.status(500).json({ success: false, error: err.message });
        }

        res.json({ 
          success: true, 
          analytics: {
            ...analytics,
            topPerformers: topPerformers || [],
            weeklyTrend: weeklyTrend || []
          }
        });
      });
    });
  });
};

// @desc    Get user task history with completion trends
// @route   GET /api/performance/user/:userId/history
exports.getUserTaskHistory = (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user.id;

  console.log(`📊 Fetching task history for user: ${userId}`);

  if (currentUserId != userId) {
    return res.status(403).json({ 
      success: false, 
      error: "Permission denied" 
    });
  }

  const query = `
    SELECT 
      date(t.created_at) as date,
      COUNT(*) as tasks_assigned,
      COUNT(CASE WHEN t.status = 'Done' THEN 1 END) as tasks_completed,
      COUNT(CASE WHEN t.status = 'In Progress' THEN 1 END) as tasks_in_progress
    FROM tasks t
    JOIN users u ON t.assignee = u.email
    WHERE u.id = ?
    GROUP BY date(t.created_at)
    ORDER BY date(t.created_at) DESC
    LIMIT 30
  `;

  db.all(query, [userId], (err, history) => {
    if (err) {
      console.error("❌ Database error:", err.message);
      return res.status(500).json({ success: false, error: err.message });
    }

    res.json({ success: true, history: history || [] });
  });
};