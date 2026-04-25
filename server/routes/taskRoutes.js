const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const db = require("../config/db");

router.use(protect);

// Get my tasks
router.get("/my-tasks", (req, res) => {
  const userEmail = req.user.email;

  console.log(`Fetching tasks for user: ${userEmail}`);

  try {
    const tasks = db.prepare(`
      SELECT * FROM tasks WHERE assignee = ? ORDER BY deadline ASC
    `).all(userEmail);
    
    console.log(`Found ${tasks.length} tasks`);
    res.json({ success: true, tasks: tasks || [] });
  } catch (err) {
    console.error("Error fetching tasks:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get tasks by story
router.get("/story/:storyId", (req, res) => {
  const { storyId } = req.params;

  try {
    const tasks = db.prepare(`
      SELECT * FROM tasks WHERE story_id = ? ORDER BY deadline ASC
    `).all(storyId);
    
    res.json({ success: true, tasks: tasks || [] });
  } catch (err) {
    console.error("Error fetching tasks by story:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create task
router.post("/", (req, res) => {
  const { story_id, title, assignee, deadline, status } = req.body;

  if (!story_id || !title) {
    return res.status(400).json({ success: false, error: "Story ID and title are required" });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO tasks (story_id, title, assignee, deadline, status) 
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(story_id, title, assignee || null, deadline || null, status || "To Do");
    
    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: { id: result.lastInsertRowid, story_id, title, assignee, deadline, status }
    });
  } catch (err) {
    console.error("Error creating task:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update task
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    db.prepare(`UPDATE tasks SET status = ? WHERE id = ?`).run(status, id);
    res.json({ success: true, message: "Task updated successfully" });
  } catch (err) {
    console.error("Error updating task:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete task
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  try {
    db.prepare(`DELETE FROM tasks WHERE id = ?`).run(id);
    res.json({ success: true, message: "Task deleted successfully" });
  } catch (err) {
    console.error("Error deleting task:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;