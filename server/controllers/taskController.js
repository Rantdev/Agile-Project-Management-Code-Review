const db = require("../config/db");
const { sendTaskEmail } = require("./emailController");

// @desc    Create task (Only Project Owner)
// @route   POST /api/tasks
exports.createTask = (req, res) => {
  const { story_id, title, assignee, deadline, status } = req.body;
  const userId = req.user.id;

  console.log("📝 Creating task for story:", story_id);

  if (!story_id || !title) {
    return res.status(400).json({ success: false, error: "Story ID and title are required" });
  }

  // Verify user is project owner
  db.get(
    `SELECT p.created_by as project_owner 
     FROM stories s 
     JOIN projects p ON s.project_id = p.id 
     WHERE s.id = ?`,
    [story_id],
    (err, story) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      if (!story) {
        return res.status(404).json({ success: false, error: "Story not found" });
      }

      // Check if user is project owner
      if (story.project_owner !== userId) {
        return res.status(403).json({ 
          success: false, 
          error: "Only the Product Owner can create tasks" 
        });
      }

      // Create task
      db.run(
        "INSERT INTO tasks (story_id, title, assignee, deadline, status, created_by) VALUES (?, ?, ?, ?, ?, ?)",
        [story_id, title, assignee || null, deadline || null, status || "To Do", userId],
        function (err) {
          if (err) {
            console.error("❌ Task creation error:", err.message);
            return res.status(500).json({ success: false, error: err.message });
          }

          const taskId = this.lastID;
          console.log("✅ Task created with ID:", taskId);

          // Send email if assignee is provided
          if (assignee) {
            const emailText = `You have been assigned a new task: "${title}".\n\nDeadline: ${deadline || "Not set"}\n\nPlease complete it as soon as possible.`;
            sendTaskEmail(assignee, "New Task Assigned", emailText)
              .then(success => {
                if (success) console.log("✅ Email sent to:", assignee);
              })
              .catch(err => console.error("❌ Email error:", err));
          }

          res.status(201).json({
            success: true,
            message: "Task created successfully",
            task: { id: taskId, story_id, title, assignee, deadline, status }
          });
        }
      );
    }
  );
};

// @desc    Get tasks by story (Anyone in team can view)
// @route   GET /api/tasks/story/:storyId
exports.getTasksByStory = (req, res) => {
  const { storyId } = req.params;
  const userId = req.user.id;
  const userEmail = req.user.email;

  // Check access
  db.get(
    `SELECT p.id, p.created_by 
     FROM stories s 
     JOIN projects p ON s.project_id = p.id 
     WHERE s.id = ? AND (p.created_by = ? OR p.id IN (
       SELECT project_id FROM team_members WHERE project_id = p.id AND user_email = ?
     ))`,
    [storyId, userId, userEmail],
    (err, project) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      if (!project) {
        return res.status(403).json({ 
          success: false, 
          error: "You don't have access to this story" 
        });
      }

      db.all(
        "SELECT * FROM tasks WHERE story_id = ? ORDER BY deadline ASC",
        [storyId],
        (err, rows) => {
          if (err) {
            return res.status(500).json({ success: false, error: err.message });
          }
          res.json({ success: true, tasks: rows || [] });
        }
      );
    }
  );
};

// @desc    Update task status (Assignee or Owner can update)
// @route   PUT /api/tasks/:id
exports.updateTask = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;  // Team members can only update status
  const userId = req.user.id;
  const userEmail = req.user.email;

  // Allow status update only
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
      if (task.project_owner !== userId && task.assignee !== userEmail) {
        return res.status(403).json({ 
          success: false, 
          error: "You don't have permission to update this task" 
        });
      }

      // Only allow status update for non-owners
      const updateFields = { status };
      
      db.run(
        `UPDATE tasks 
         SET status = COALESCE(?, status),
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [status, id],
        function (err) {
          if (err) {
            return res.status(500).json({ success: false, error: err.message });
          }
          
          res.json({ 
            success: true, 
            message: "Task status updated successfully" 
          });
        }
      );
    }
  );
};

// @desc    Delete task (Only Project Owner)
// @route   DELETE /api/tasks/:id
exports.deleteTask = (req, res) => {
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

      db.run("DELETE FROM tasks WHERE id = ?", [id], function (err) {
        if (err) {
          return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, message: "Task deleted successfully" });
      });
    }
  );
};

// @desc    Get my assigned tasks
// @route   GET /api/tasks/my-tasks
exports.getMyTasks = (req, res) => {
  const userEmail = req.user.email;

  db.all(
    `
    SELECT t.*, 
           s.title as story_title, 
           p.title as project_title, 
           p.id as project_id,
           p.created_by as project_owner
    FROM tasks t
    JOIN stories s ON t.story_id = s.id
    JOIN projects p ON s.project_id = p.id
    WHERE t.assignee = ?
    ORDER BY 
      CASE WHEN t.status = 'Done' THEN 2 ELSE 1 END,
      t.deadline ASC
    `,
    [userEmail],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      res.json({ success: true, tasks: rows || [] });
    }
  );
};