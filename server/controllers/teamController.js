const db = require("../config/db");
const { sendTeamMemberEmail } = require("./emailController");

// Add team member with email notification
exports.addMember = (req, res) => {
  const { project_id, user_email, role } = req.body;
  const userId = req.user.id;

  console.log(`Adding team member ${user_email} to project ${project_id}`);

  try {
    // Check if user owns the project
    const project = db.prepare(`
      SELECT created_by, title FROM projects WHERE id = ?
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

    // Check if user exists in the system
    const userToAdd = db.prepare(`
      SELECT id, name, email FROM users WHERE email = ?
    `).get(user_email);
    
    if (!userToAdd) {
      return res.status(404).json({ success: false, error: "User not found. They need to register first." });
    }

    // Add to team
    const result = db.prepare(`
      INSERT INTO team_members (project_id, user_email, role) 
      VALUES (?, ?, ?)
    `).run(project_id, user_email, role || "member");
    
    // Send email notification
    sendTeamMemberEmail(user_email, project.title, role || "member", req.user.name);
    
    res.status(201).json({
      success: true,
      message: "Member added successfully. Email notification sent.",
      member: { id: result.lastInsertRowid, project_id, user_email, role: role || "member" }
    });
  } catch (err) {
    console.error("Error adding team member:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get team members (updated to include user names)
exports.getMembers = (req, res) => {
  const { projectId } = req.params;

  try {
    const members = db.prepare(`
      SELECT tm.id, tm.user_email, tm.role, tm.joined_at, u.name
      FROM team_members tm
      LEFT JOIN users u ON tm.user_email = u.email
      WHERE tm.project_id = ?
      ORDER BY tm.joined_at DESC
    `).all(projectId);
    
    res.json({ success: true, members: members || [] });
  } catch (err) {
    console.error("Error fetching members:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete team member
exports.deleteMember = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Get project info
    const member = db.prepare(`
      SELECT tm.project_id, p.created_by, tm.user_email
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
    console.error("Error deleting member:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = exports;