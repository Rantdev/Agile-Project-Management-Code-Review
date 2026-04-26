const db = require("../config/db");
const { sendTaskEmail } = require("./emailController");

// Create task
exports.createTask = (req, res) => {
  const { story_id, title, assignee, deadline, status } = req.body;
  const created_by = req.user.id;

  console.log("Creating task:", { story_id, title, assignee, deadline });

  if (!story_id || !title) {
    return res.status(400).json({ success: false, error: "Story ID and title are required" });
  }

  try {
    // Verify story exists
    const story = db.prepare("SELECT id, project_id FROM stories WHERE id = ?").get(story_id);
    
    if (!story) {
      return res.status(404).json({ success: false, error: "Story not found" });
    }

    const result = db.prepare(`
      INSERT INTO tasks (story_id, title, assignee, deadline, status, created_by) 
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(story_id, title, assignee || null, deadline || null, status || "To Do", created_by);
    
    // Send email if assignee provided
    if (assignee) {
      const assigneeInfo = db.prepare("SELECT name FROM users WHERE email = ?").get(assignee);
      if (assigneeInfo) {
        sendTaskEmail(assignee, "New Task Assigned", `You have been assigned: ${title}`);
      }
    }
    
    const newTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(result.lastInsertRowid);
    
    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: newTask
    });
  } catch (err) {
    console.error("Error creating task:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get tasks by story
exports.getTasksByStory = (req, res) => {
  const { storyId } = req.params;

  console.log("Fetching tasks for story ID:", storyId);

  try {
    const tasks = db.prepare(`
      SELECT * FROM tasks WHERE story_id = ? ORDER BY deadline ASC
    `).all(storyId);
    
    console.log(`Found ${tasks.length} tasks`);
    res.json({ success: true, tasks: tasks || [] });
  } catch (err) {
    console.error("Error fetching tasks:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get my tasks
exports.getMyTasks = (req, res) => {
  const userEmail = req.user.email;

  try {
    const tasks = db.prepare(`
      SELECT t.*, s.title as story_title, p.title as project_title
      FROM tasks t
      JOIN stories s ON t.story_id = s.id
      JOIN projects p ON s.project_id = p.id
      WHERE t.assignee = ?
      ORDER BY t.deadline ASC
    `).all(userEmail);
    
    res.json({ success: true, tasks: tasks || [] });
  } catch (err) {
    console.error("Error fetching my tasks:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update task
exports.updateTask = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    db.prepare(`UPDATE tasks SET status = ? WHERE id = ?`).run(status, id);
    res.json({ success: true, message: "Task updated successfully" });
  } catch (err) {
    console.error("Error updating task:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete task
exports.deleteTask = (req, res) => {
  const { id } = req.params;

  try {
    db.prepare(`DELETE FROM tasks WHERE id = ?`).run(id);
    res.json({ success: true, message: "Task deleted successfully" });
  } catch (err) {
    console.error("Error deleting task:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = exports;