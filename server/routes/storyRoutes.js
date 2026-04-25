const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const db = require("../config/db");

router.use(protect);

// Get stories by project
router.get("/project/:projectId", (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;

  console.log(`Fetching stories for project: ${projectId}`);

  try {
    // First check if user has access to this project
    const project = db.prepare(`
      SELECT id FROM projects WHERE id = ? AND created_by = ?
    `).get(projectId, userId);
    
    if (!project) {
      return res.status(403).json({ success: false, error: "You don't have access to this project" });
    }

    const stories = db.prepare(`
      SELECT * FROM stories WHERE project_id = ? ORDER BY created_at DESC
    `).all(projectId);
    
    console.log(`Found ${stories.length} stories`);
    res.json({ success: true, stories: stories || [] });
  } catch (err) {
    console.error("Error fetching stories:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get single story by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  console.log(`Fetching story: ${id}`);

  try {
    const story = db.prepare(`
      SELECT s.*, p.created_by as project_owner 
      FROM stories s
      JOIN projects p ON s.project_id = p.id
      WHERE s.id = ?
    `).get(id);
    
    if (!story) {
      return res.status(404).json({ success: false, error: "Story not found" });
    }
    
    // Check if user has access to the project
    if (story.project_owner !== userId) {
      return res.status(403).json({ success: false, error: "You don't have access to this story" });
    }
    
    // Get tasks for this story
    const tasks = db.prepare(`
      SELECT * FROM tasks WHERE story_id = ? ORDER BY deadline ASC
    `).all(id);
    
    story.tasks = tasks || [];
    
    res.json({ success: true, story });
  } catch (err) {
    console.error("Error fetching story:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create story
router.post("/", (req, res) => {
  const { project_id, title, description, status } = req.body;
  const userId = req.user.id;

  console.log(`Creating story for project: ${project_id}`);

  if (!project_id || !title) {
    return res.status(400).json({ success: false, error: "Project ID and title are required" });
  }

  try {
    // Check if user owns the project
    const project = db.prepare(`
      SELECT created_by FROM projects WHERE id = ?
    `).get(project_id);
    
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }
    
    if (project.created_by !== userId) {
      return res.status(403).json({ success: false, error: "Only the project owner can create stories" });
    }

    const stmt = db.prepare(`
      INSERT INTO stories (project_id, title, description, status) 
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(project_id, title, description || "", status || "To Do");
    
    res.status(201).json({
      success: true,
      message: "Story created successfully",
      story: { 
        id: result.lastInsertRowid, 
        project_id, 
        title, 
        description, 
        status: status || "To Do" 
      }
    });
  } catch (err) {
    console.error("Error creating story:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update story
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;
  const userId = req.user.id;

  try {
    // Check if user owns the project
    const story = db.prepare(`
      SELECT s.*, p.created_by as project_owner 
      FROM stories s
      JOIN projects p ON s.project_id = p.id
      WHERE s.id = ?
    `).get(id);
    
    if (!story) {
      return res.status(404).json({ success: false, error: "Story not found" });
    }
    
    if (story.project_owner !== userId) {
      return res.status(403).json({ success: false, error: "Only the project owner can update stories" });
    }

    db.prepare(`
      UPDATE stories SET title = ?, description = ?, status = ? WHERE id = ?
    `).run(title, description, status, id);
    
    res.json({ success: true, message: "Story updated successfully" });
  } catch (err) {
    console.error("Error updating story:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete story
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Check if user owns the project
    const story = db.prepare(`
      SELECT s.*, p.created_by as project_owner 
      FROM stories s
      JOIN projects p ON s.project_id = p.id
      WHERE s.id = ?
    `).get(id);
    
    if (!story) {
      return res.status(404).json({ success: false, error: "Story not found" });
    }
    
    if (story.project_owner !== userId) {
      return res.status(403).json({ success: false, error: "Only the project owner can delete stories" });
    }

    db.prepare(`DELETE FROM stories WHERE id = ?`).run(id);
    
    res.json({ success: true, message: "Story deleted successfully" });
  } catch (err) {
    console.error("Error deleting story:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;