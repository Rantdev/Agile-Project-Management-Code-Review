const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const db = require("../config/db");

router.use(protect);

router.get("/", (req, res) => {
  try {
    const projects = db.prepare("SELECT * FROM projects WHERE created_by = ? ORDER BY created_at DESC").all(req.user.id);
    res.json({ success: true, projects: projects || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/:id", (req, res) => {
  try {
    const project = db.prepare("SELECT * FROM projects WHERE id = ? AND created_by = ?").get(req.params.id, req.user.id);
    if (!project) return res.status(404).json({ success: false, error: "Project not found" });
    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/", (req, res) => {
  const { title, description, status } = req.body;
  if (!title) return res.status(400).json({ success: false, error: "Project title is required" });

  try {
    const result = db.prepare("INSERT INTO projects (title, description, status, created_by) VALUES (?, ?, ?, ?)")
      .run(title, description || "", status || "Planning", req.user.id);
    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project: { id: result.lastInsertRowid, title, description, status: status || "Planning", created_by: req.user.id }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put("/:id", (req, res) => {
  const { title, description, status } = req.body;
  try {
    const project = db.prepare("SELECT created_by FROM projects WHERE id = ?").get(req.params.id);
    if (!project) return res.status(404).json({ success: false, error: "Project not found" });
    if (project.created_by !== req.user.id) return res.status(403).json({ success: false, error: "Permission denied" });
    db.prepare("UPDATE projects SET title = ?, description = ?, status = ? WHERE id = ?").run(title, description, status, req.params.id);
    res.json({ success: true, message: "Project updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/:id", (req, res) => {
  try {
    const project = db.prepare("SELECT created_by FROM projects WHERE id = ?").get(req.params.id);
    if (!project) return res.status(404).json({ success: false, error: "Project not found" });
    if (project.created_by !== req.user.id) return res.status(403).json({ success: false, error: "Permission denied" });
    db.prepare("DELETE FROM projects WHERE id = ?").run(req.params.id);
    res.json({ success: true, message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;