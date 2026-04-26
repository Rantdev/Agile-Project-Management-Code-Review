const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const db = require("../config/db");

router.use(protect);

// Get user profile
router.get("/:userId", (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user.id;

  console.log(`Fetching profile for user: ${userId}, Current user: ${currentUserId}`);

  try {
    // Allow users to view their own profile only
    if (parseInt(currentUserId) !== parseInt(userId)) {
      return res.status(403).json({ success: false, error: "You can only view your own profile" });
    }

    const user = db.prepare(`
      SELECT id, name, email, role, created_at 
      FROM users 
      WHERE id = ?
    `).get(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    
    // Get user skills
    const skills = db.prepare(`
      SELECT id, skill_name as name, skill_level as level 
      FROM user_skills 
      WHERE user_id = ?
    `).all(userId);
    
    user.skills = skills || [];
    
    console.log(`Profile found: ${user.name}`);
    res.json({ success: true, profile: user });
  } catch (err) {
    console.error("Profile error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update user profile
router.put("/:userId", (req, res) => {
  const { userId } = req.params;
  const { name, bio, phone, location, skills } = req.body;
  const currentUserId = req.user.id;

  if (parseInt(currentUserId) !== parseInt(userId)) {
    return res.status(403).json({ success: false, error: "You can only update your own profile" });
  }

  try {
    // Update basic info
    if (name) {
      db.prepare("UPDATE users SET name = ? WHERE id = ?").run(name, userId);
    }
    if (bio) {
      db.prepare("UPDATE users SET bio = ? WHERE id = ?").run(bio, userId);
    }
    if (phone) {
      db.prepare("UPDATE users SET phone = ? WHERE id = ?").run(phone, userId);
    }
    if (location) {
      db.prepare("UPDATE users SET location = ? WHERE id = ?").run(location, userId);
    }
    
    // Update skills (delete old, insert new)
    if (skills && Array.isArray(skills)) {
      db.prepare("DELETE FROM user_skills WHERE user_id = ?").run(userId);
      const stmt = db.prepare("INSERT INTO user_skills (user_id, skill_name, skill_level) VALUES (?, ?, ?)");
      skills.forEach(skill => {
        stmt.run(userId, skill.name, skill.level || "Intermediate");
      });
    }
    
    res.json({ success: true, message: "Profile updated successfully" });
  } catch (err) {
    console.error("Update profile error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Setup user role (for new users)
router.post("/setup-role", (req, res) => {
  const { role, department, skills } = req.body;
  const userId = req.user.id;

  console.log(`Setting up role for user ${userId}: ${role}`);

  const validRoles = [
    "UI Developer", "Frontend Developer", "Backend Developer", 
    "Full Stack Developer", "Tester", "DevOps", "Product Owner", 
    "Scrum Master", "Designer", "Project Manager"
  ];

  if (!validRoles.includes(role)) {
    return res.status(400).json({ success: false, error: "Invalid role selected" });
  }

  try {
    db.prepare("UPDATE users SET role = ?, department = ? WHERE id = ?")
      .run(role, department || null, userId);
    
    if (skills && Array.isArray(skills) && skills.length > 0) {
      const stmt = db.prepare("INSERT INTO user_skills (user_id, skill_name, skill_level) VALUES (?, ?, ?)");
      skills.forEach(skill => {
        stmt.run(userId, skill.name, skill.level || 'Intermediate');
      });
    }
    
    // Get updated user
    const updatedUser = db.prepare("SELECT id, name, email, role FROM users WHERE id = ?").get(userId);
    
    res.json({ 
      success: true, 
      message: "Role setup completed",
      user: updatedUser
    });
  } catch (err) {
    console.error("Role setup error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;