const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const db = require("../config/db");

router.use(protect);

// Get team members by project
router.get("/:projectId", (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;

  console.log(`Fetching team members for project: ${projectId}`);

  try {
    // Check if user has access to this project
    const project = db.prepare(`
      SELECT id, created_by FROM projects WHERE id = ?
    `).get(projectId);
    
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }

    // Get all team members
    const members = db.prepare(`
      SELECT id, user_email, role, joined_at 
      FROM team_members 
      WHERE project_id = ?
      ORDER BY joined_at DESC
    `).all(projectId);
    
    console.log(`Found ${members.length} team members`);
    res.json({ success: true, members: members || [] });
  } catch (err) {
    console.error("Error fetching team members:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Add team member
router.post("/", (req, res) => {
  const { project_id, user_email, role } = req.body;
  const userId = req.user.id;

  console.log(`Adding team member ${user_email} to project ${project_id}`);

  try {
    // Check if user owns the project
    const project = db.prepare(`
      SELECT created_by FROM projects WHERE id = ?
    `).get(project_id);
    
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }
    
    if (project.created_by !== userId) {
      return res.status(403).json({ success: false, error: "Only project owner can add members" });
    }

    // Check if member already exists
    const existing = db.prepare(`
      SELECT id FROM team_members WHERE project_id = ? AND user_email = ?
    `).get(project_id, user_email);
    
    if (existing) {
      return res.status(400).json({ success: false, error: "Member already in team" });
    }

    const result = db.prepare(`
      INSERT INTO team_members (project_id, user_email, role) 
      VALUES (?, ?, ?)
    `).run(project_id, user_email, role || "member");
    
    res.status(201).json({
      success: true,
      message: "Member added successfully",
      member: { id: result.lastInsertRowid, project_id, user_email, role: role || "member" }
    });
  } catch (err) {
    console.error("Error adding team member:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete team member
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  console.log(`Deleting team member ${id}`);

  try {
    // Get project_id from team_member
    const member = db.prepare(`
      SELECT tm.project_id, p.created_by 
      FROM team_members tm
      JOIN projects p ON tm.project_id = p.id
      WHERE tm.id = ?
    `).get(id);
    
    if (!member) {
      return res.status(404).json({ success: false, error: "Member not found" });
    }
    
    if (member.created_by !== userId) {
      return res.status(403).json({ success: false, error: "Only project owner can remove members" });
    }

    db.prepare(`DELETE FROM team_members WHERE id = ?`).run(id);
    
    res.json({ success: true, message: "Member removed successfully" });
  } catch (err) {
    console.error("Error deleting team member:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;