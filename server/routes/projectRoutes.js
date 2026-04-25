const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const db = require("../config/db");

// Apply authentication to all routes
router.use(protect);

// @route   POST /api/projects
router.post("/", (req, res) => {
  const { title, description, status } = req.body;
  const created_by = req.user.id;

  if (!title) {
    return res.status(400).json({ success: false, error: "Project title is required" });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO projects (title, description, status, created_by) 
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(title, description || "", status || "Planning", created_by);
    
    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project: { 
        id: result.lastInsertRowid, 
        title, 
        description, 
        status: status || "Planning", 
        created_by 
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/projects
router.get("/", (req, res) => {
  const userId = req.user.id;

  try {
    const projects = db.prepare(`
      SELECT * FROM projects WHERE created_by = ? ORDER BY created_at DESC
    `).all(userId);
    
    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/projects/:id
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const project = db.prepare(`
      SELECT * FROM projects WHERE id = ? AND created_by = ?
    `).get(id, userId);
    
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }
    
    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   PUT /api/projects/:id
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;
  const userId = req.user.id;

  try {
    const project = db.prepare(`SELECT created_by FROM projects WHERE id = ?`).get(id);
    
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }
    
    if (project.created_by !== userId) {
      return res.status(403).json({ success: false, error: "Permission denied" });
    }

    db.prepare(`
      UPDATE projects SET title = ?, description = ?, status = ? WHERE id = ?
    `).run(title, description, status, id);
    
    res.json({ success: true, message: "Project updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   DELETE /api/projects/:id
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const project = db.prepare(`SELECT created_by FROM projects WHERE id = ?`).get(id);
    
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }
    
    if (project.created_by !== userId) {
      return res.status(403).json({ success: false, error: "Permission denied" });
    }

    db.prepare(`DELETE FROM projects WHERE id = ?`).run(id);
    
    res.json({ success: true, message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
