const db = require("../config/db");

// @desc    Add team member (Only Project Owner)
// @route   POST /api/team
exports.addMember = (req, res) => {
  const { project_id, user_email, role } = req.body;
  const userId = req.user.id;

  // Verify user is project owner
  db.get(
    "SELECT created_by FROM projects WHERE id = ?",
    [project_id],
    (err, project) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      if (!project) {
        return res.status(404).json({ success: false, error: "Project not found" });
      }
      if (project.created_by !== userId) {
        return res.status(403).json({ 
          success: false, 
          error: "Only the Product Owner can add team members" 
        });
      }

      // Add member
      db.run(
        "INSERT INTO team_members (project_id, user_email, role) VALUES (?, ?, ?)",
        [project_id, user_email, role || "member"],
        function (err) {
          if (err) {
            if (err.message.includes("UNIQUE")) {
              return res.status(400).json({ success: false, error: "Member already in team" });
            }
            return res.status(500).json({ success: false, error: err.message });
          }
          res.status(201).json({
            success: true,
            message: "Member added successfully",
            member: { id: this.lastID, project_id, user_email, role }
          });
        }
      );
    }
  );
};

// @desc    Get team members (Anyone in team can view)
// @route   GET /api/team/project/:projectId
exports.getMembers = (req, res) => {
  const { projectId } = req.params;

  db.all(
    "SELECT id, user_email, role, joined_at FROM team_members WHERE project_id = ? ORDER BY joined_at DESC",
    [projectId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      res.json({ success: true, members: rows || [] });
    }
  );
};

// @desc    Delete team member (Only Project Owner)
// @route   DELETE /api/team/:id
exports.deleteMember = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // First get project_id from team_member
  db.get(
    `SELECT tm.project_id, p.created_by 
     FROM team_members tm 
     JOIN projects p ON tm.project_id = p.id 
     WHERE tm.id = ?`,
    [id],
    (err, member) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      if (!member) {
        return res.status(404).json({ success: false, error: "Member not found" });
      }
      if (member.created_by !== userId) {
        return res.status(403).json({ 
          success: false, 
          error: "Only the Product Owner can remove team members" 
        });
      }

      db.run("DELETE FROM team_members WHERE id = ?", [id], function (err) {
        if (err) {
          return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, message: "Member removed successfully" });
      });
    }
  );
};