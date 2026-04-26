const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const db = require("../config/db");

router.use(protect);

const router = express.Router();
const { protect } = require("../middleware/auth");
const { addMember, getMembers, deleteMember } = require("../controllers/teamController");

router.post("/", addMember);
router.get("/project/:projectId", getMembers);
router.delete("/:id", deleteMember);

router.get("/project/:projectId", (req, res) => {
  try {
    const members = db.prepare("SELECT * FROM team_members WHERE project_id = ?").all(req.params.projectId);
    res.json({ success: true, members: members || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/", (req, res) => {
  const { project_id, user_email, role } = req.body;
  try {
    const result = db.prepare("INSERT INTO team_members (project_id, user_email, role) VALUES (?, ?, ?)")
      .run(project_id, user_email, role || "member");
    res.status(201).json({ success: true, message: "Member added successfully", member: { id: result.lastInsertRowid, project_id, user_email, role } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM team_members WHERE id = ?").run(req.params.id);
    res.json({ success: true, message: "Member removed successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;