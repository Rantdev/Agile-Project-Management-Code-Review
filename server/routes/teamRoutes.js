const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const db = require("../config/db");

// Apply authentication to all routes
router.use(protect);

// Get team members by project
router.get("/project/:projectId", (req, res) => {
  try {
    const members = db.prepare("SELECT * FROM team_members WHERE project_id = ?").all(req.params.projectId);
    res.json({ success: true, members: members || [] });
  } catch (err) {
    console.error("Error fetching members:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Add team member
router.post("/", (req, res) => {
  const { project_id, user_email, role } = req.body;
  
  try {
    // Check if member already exists
    const existing = db.prepare("SELECT id FROM team_members WHERE project_id = ? AND user_email = ?")
      .get(project_id, user_email);
    
    if (existing) {
      return res.status(400).json({ success: false, error: "Member already in team" });
    }
    
    const result = db.prepare("INSERT INTO team_members (project_id, user_email, role) VALUES (?, ?, ?)")
      .run(project_id, user_email, role || "member");
      
    res.status(201).json({ 
      success: true, 
      message: "Member added successfully", 
      member: { id: result.lastInsertRowid, project_id, user_email, role: role || "member" }
    });
  } catch (err) {
    console.error("Error adding member:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete team member
router.delete("/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM team_members WHERE id = ?").run(req.params.id);
    res.json({ success: true, message: "Member removed successfully" });
  } catch (err) {
    console.error("Error deleting member:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;