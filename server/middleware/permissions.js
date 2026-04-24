const db = require("../config/db");

// Check if user is project owner (Product Owner)
const isProjectOwner = (req, res, next) => {
  const { projectId } = req.params;
  const userId = req.user.id;

  db.get(
    "SELECT created_by FROM projects WHERE id = ?",
    [projectId],
    (err, project) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      if (!project) {
        return res.status(404).json({ success: false, error: "Project not found" });
      }
      if (project.created_by !== userId) {
        return res.status(403).json({ 
          success: false, 
          error: "Only the Product Owner can perform this action" 
        });
      }
      next();
    }
  );
};

// Check if user can edit task (owner or assignee)
const canEditTask = (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userEmail = req.user.email;

  db.get(
    `SELECT t.*, p.created_by as project_owner 
     FROM tasks t 
     JOIN stories s ON t.story_id = s.id 
     JOIN projects p ON s.project_id = p.id 
     WHERE t.id = ?`,
    [id],
    (err, task) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      if (!task) {
        return res.status(404).json({ success: false, error: "Task not found" });
      }

      // Allow if user is project owner OR task assignee
      if (task.project_owner === userId || task.assignee === userEmail) {
        req.task = task;
        return next();
      }

      return res.status(403).json({ 
        success: false, 
        error: "You don't have permission to edit this task" 
      });
    }
  );
};

// Check if user can delete task (only project owner)
const canDeleteTask = (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  db.get(
    `SELECT p.created_by as project_owner 
     FROM tasks t 
     JOIN stories s ON t.story_id = s.id 
     JOIN projects p ON s.project_id = p.id 
     WHERE t.id = ?`,
    [id],
    (err, task) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      if (!task) {
        return res.status(404).json({ success: false, error: "Task not found" });
      }

      if (task.project_owner !== userId) {
        return res.status(403).json({ 
          success: false, 
          error: "Only the Product Owner can delete tasks" 
        });
      }
      next();
    }
  );
};

// Check if user is team member (can view project)
const isTeamMember = (req, res, next) => {
  const { projectId } = req.params;
  const userId = req.user.id;
  const userEmail = req.user.email;

  db.get(
    `SELECT id FROM projects 
     WHERE id = ? AND (created_by = ? OR id IN (
       SELECT project_id FROM team_members WHERE project_id = ? AND user_email = ?
     ))`,
    [projectId, userId, projectId, userEmail],
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
      next();
    }
  );
};

module.exports = { isProjectOwner, canEditTask, canDeleteTask, isTeamMember };