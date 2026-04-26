const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const db = require("../config/db");

router.use(protect);

router.get("/:userId", (req, res) => {
  const { userId } = req.params;
  if (parseInt(req.user.id) !== parseInt(userId)) {
    return res.status(403).json({ success: false, error: "You can only view your own profile" });
  }

  db.get("SELECT id, name, email, role, created_at FROM users WHERE id = ?", [userId], (err, profile) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!profile) return res.status(404).json({ success: false, error: "User not found" });
    db.all("SELECT id, skill_name as name, skill_level as level FROM user_skills WHERE user_id = ?", [userId], (err, skills) => {
      profile.skills = skills || [];
      res.json({ success: true, profile });
    });
  });
});

router.put("/:userId", (req, res) => {
  const { userId } = req.params;
  const { name, bio, phone, location, skills } = req.body;
  if (parseInt(req.user.id) !== parseInt(userId)) {
    return res.status(403).json({ success: false, error: "You can only update your own profile" });
  }

  try {
    if (name) db.run("UPDATE users SET name = ? WHERE id = ?", name, userId);
    if (bio) db.run("UPDATE users SET bio = ? WHERE id = ?", bio, userId);
    if (phone) db.run("UPDATE users SET phone = ? WHERE id = ?", phone, userId);
    if (location) db.run("UPDATE users SET location = ? WHERE id = ?", location, userId);
    
    if (skills && Array.isArray(skills)) {
      db.run("DELETE FROM user_skills WHERE user_id = ?", userId);
      const stmt = db.prepare("INSERT INTO user_skills (user_id, skill_name, skill_level) VALUES (?, ?, ?)");
      skills.forEach(skill => stmt.run(userId, skill.name, skill.level || "Intermediate"));
      stmt.finalize();
    }
    res.json({ success: true, message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/setup-role", (req, res) => {
  const { role, department, skills } = req.body;
  const userId = req.user.id;

  const validRoles = ['UI Developer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Tester', 'DevOps', 'Product Owner', 'Scrum Master', 'Designer', 'Project Manager'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ success: false, error: "Invalid role selected" });
  }

  db.run("UPDATE users SET role = ?, department = ? WHERE id = ?", [role, department || null, userId], function(err) {
    if (err) return res.status(500).json({ success: false, error: err.message });

    if (skills && Array.isArray(skills) && skills.length > 0) {
      db.run("DELETE FROM user_skills WHERE user_id = ?", userId);
      const stmt = db.prepare("INSERT INTO user_skills (user_id, skill_name, skill_level) VALUES (?, ?, ?)");
      skills.forEach(skill => stmt.run(userId, skill.name, skill.level || 'Intermediate'));
      stmt.finalize();
    }

    db.get("SELECT id, name, email, role FROM users WHERE id = ?", [userId], (err, updatedUser) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      res.json({ success: true, message: "Role setup completed successfully", user: updatedUser });
    });
  });
});

module.exports = router;