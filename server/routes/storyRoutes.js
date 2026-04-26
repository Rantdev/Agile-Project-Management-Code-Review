const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const db = require("../config/db");

router.use(protect);

router.get("/project/:projectId", (req, res) => {
  try {
    const stories = db.prepare("SELECT * FROM stories WHERE project_id = ? ORDER BY created_at DESC").all(req.params.projectId);
    res.json({ success: true, stories: stories || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/:id", (req, res) => {
  try {
    const story = db.prepare("SELECT * FROM stories WHERE id = ?").get(req.params.id);
    if (!story) return res.status(404).json({ success: false, error: "Story not found" });
    const tasks = db.prepare("SELECT * FROM tasks WHERE story_id = ?").all(req.params.id);
    story.tasks = tasks || [];
    res.json({ success: true, story });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/", (req, res) => {
  const { project_id, title, description, status } = req.body;
  if (!project_id || !title) return res.status(400).json({ success: false, error: "Project ID and title are required" });

  try {
    const result = db.prepare("INSERT INTO stories (project_id, title, description, status) VALUES (?, ?, ?, ?)")
      .run(project_id, title, description || "", status || "To Do");
    res.status(201).json({
      success: true,
      message: "Story created successfully",
      story: { id: result.lastInsertRowid, project_id, title, description, status: status || "To Do" }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put("/:id", (req, res) => {
  const { title, description, status } = req.body;
  try {
    db.prepare("UPDATE stories SET title = ?, description = ?, status = ? WHERE id = ?").run(title, description, status, req.params.id);
    res.json({ success: true, message: "Story updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM stories WHERE id = ?").run(req.params.id);
    res.json({ success: true, message: "Story deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;