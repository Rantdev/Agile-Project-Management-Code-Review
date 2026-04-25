const db = require("../config/db");

// @desc    Create task
exports.createTask = (req, res) => {
  const { story_id, title, assignee, deadline, status } = req.body;

  if (!story_id || !title) {
    return res.status(400).json({ success: false, error: "Story ID and title are required" });
  }

  db.run(
    "INSERT INTO tasks (story_id, title, assignee, deadline, status) VALUES (?, ?, ?, ?, ?)",
    [story_id, title, assignee || null, deadline || null, status || "To Do"],
    function (err) {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }

      res.status(201).json({
        success: true,
        message: "Task created successfully",
        task: { id: this.lastID, story_id, title, assignee, deadline, status }
      });
    }
  );
};

// @desc    Get tasks by story
exports.getTasksByStory = (req, res) => {
  const { storyId } = req.params;

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
};

// @desc    Get my tasks
exports.getMyTasks = (req, res) => {
  const userEmail = req.user.email;

  const query = `
    SELECT t.*, s.title as story_title, p.title as project_title 
    FROM tasks t
    JOIN stories s ON t.story_id = s.id
    JOIN projects p ON s.project_id = p.id
    WHERE t.assignee = ?
    ORDER BY t.deadline ASC
  `;

  db.all(query, [userEmail], (err, rows) => {
    if (err) {
      console.error("❌ Error in getMyTasks:", err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, tasks: rows || [] });
  });
};

// @desc    Update task
exports.updateTask = (req, res) => {
  const { id } = req.params;
  const { title, assignee, deadline, status } = req.body;

  db.run(
    "UPDATE tasks SET title = ?, assignee = ?, deadline = ?, status = ? WHERE id = ?",
    [title, assignee, deadline, status, id],
    function (err) {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      res.json({ success: true, message: "Task updated successfully" });
    }
  );
};

// @desc    Delete task
exports.deleteTask = (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM tasks WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, message: "Task deleted successfully" });
  });
};