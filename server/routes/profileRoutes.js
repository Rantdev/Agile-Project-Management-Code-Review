const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const db = require("../config/db");

router.use(protect);

// Get profile
router.get("/:userId", (req, res) => {
  try {
    const user = db.prepare(`
      SELECT id, name, email, role, created_at FROM users WHERE id = ?
    `).get(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    
    const skills = db.prepare(`
      SELECT id, skill_name as name, skill_level as level FROM user_skills WHERE user_id = ?
    `).all(req.params.userId);
    
    user.skills = skills || [];
    
    res.json({ success: true, profile: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update profile
router.put("/:userId", (req, res) => {
  const { name, bio, phone, location, skills } = req.body;

  try {
    if (name) db.prepare(`UPDATE users SET name = ? WHERE id = ?`).run(name, req.params.userId);
    if (bio) db.prepare(`UPDATE users SET bio = ? WHERE id = ?`).run(bio, req.params.userId);
    if (phone) db.prepare(`UPDATE users SET phone = ? WHERE id = ?`).run(phone, req.params.userId);
    if (location) db.prepare(`UPDATE users SET location = ? WHERE id = ?`).run(location, req.params.userId);
    
    if (skills && Array.isArray(skills)) {
      db.prepare(`DELETE FROM user_skills WHERE user_id = ?`).run(req.params.userId);
      const stmt = db.prepare(`INSERT INTO user_skills (user_id, skill_name, skill_level) VALUES (?, ?, ?)`);
      skills.forEach(skill => stmt.run(req.params.userId, skill.name, skill.level || "Intermediate"));
    }
    
    res.json({ success: true, message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Setup role
router.post("/setup-role", (req, res) => {
  const { role, department, skills } = req.body;

  const validRoles = ['UI Developer', 'Frontend Developer', 'Backend Developer', 
                      'Full Stack Developer', 'Tester', 'DevOps', 'Product Owner', 
                      'Scrum Master', 'Designer', 'Project Manager'];

  if (!validRoles.includes(role)) {
    return res.status(400).json({ success: false, error: "Invalid role selected" });
  }

  try {
    db.prepare(`UPDATE users SET role = ?, department = ? WHERE id = ?`)
      .run(role, department || null, req.user.id);
    
    if (skills && Array.isArray(skills) && skills.length > 0) {
      const stmt = db.prepare(`INSERT INTO user_skills (user_id, skill_name, skill_level) VALUES (?, ?, ?)`);
      skills.forEach(skill => stmt.run(req.user.id, skill.name, skill.level || 'Intermediate'));
    }
    
    res.json({ success: true, message: "Role setup completed" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;