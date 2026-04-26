const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const db = require("../config/db");

// All routes require authentication
router.use(protect);

// Get user profile
router.get("/:userId", (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user.id;

  console.log(`📝 Fetching profile for user ID: ${userId}, Current user: ${currentUserId}`);

  // Allow viewing own profile only
  if (parseInt(currentUserId) !== parseInt(userId)) {
    return res.status(403).json({ 
      success: false, 
      error: "You can only view your own profile" 
    });
  }

  const query = `
    SELECT 
      u.id, 
      u.name, 
      u.email, 
      COALESCE(u.bio, '') as bio,
      COALESCE(u.avatar, '') as avatar,
      COALESCE(u.department, '') as department,
      COALESCE(u.phone, '') as phone,
      COALESCE(u.location, '') as location,
      COALESCE(u.github, '') as github,
      COALESCE(u.linkedin, '') as linkedin,
      COALESCE(u.role, 'member') as role,
      u.created_at,
      u.updated_at
    FROM users u
    WHERE u.id = ?
  `;

  db.get(query, [userId], (err, profile) => {
    if (err) {
      console.error("❌ Database error:", err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
    
    if (!profile) {
      console.log("❌ User not found:", userId);
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Get user skills
    db.all(
      "SELECT id, skill_name as name, skill_level as level FROM user_skills WHERE user_id = ? ORDER BY created_at DESC",
      [userId], 
      (err, skills) => {
        if (err) {
          console.error("❌ Skills fetch error:", err.message);
          return res.status(500).json({ success: false, error: err.message });
        }
        
        profile.skills = skills || [];
        console.log(`✅ Profile found: ${profile.name} with ${profile.skills.length} skills`);
        res.json({ success: true, profile });
      }
    );
  });
});

// Update user profile
router.put("/:userId", (req, res) => {
  const { userId } = req.params;
  const { name, bio, department, phone, location, github, linkedin, skills } = req.body;
  const currentUserId = req.user.id;

  console.log(`📝 Updating profile for user: ${userId}`);

  // Check permission
  if (parseInt(currentUserId) !== parseInt(userId)) {
    return res.status(403).json({ 
      success: false, 
      error: "You can only update your own profile" 
    });
  }

  // Build dynamic update query
  const updateFields = [];
  const updateValues = [];

  if (name !== undefined && name !== null) {
    updateFields.push("name = ?");
    updateValues.push(name);
  }
  if (bio !== undefined && bio !== null) {
    updateFields.push("bio = ?");
    updateValues.push(bio);
  }
  if (department !== undefined && department !== null) {
    updateFields.push("department = ?");
    updateValues.push(department);
  }
  if (phone !== undefined && phone !== null) {
    updateFields.push("phone = ?");
    updateValues.push(phone);
  }
  if (location !== undefined && location !== null) {
    updateFields.push("location = ?");
    updateValues.push(location);
  }
  if (github !== undefined && github !== null) {
    updateFields.push("github = ?");
    updateValues.push(github);
  }
  if (linkedin !== undefined && linkedin !== null) {
    updateFields.push("linkedin = ?");
    updateValues.push(linkedin);
  }

  // First, update profile fields
  if (updateFields.length > 0) {
    updateFields.push("updated_at = CURRENT_TIMESTAMP");
    updateValues.push(userId);

    const updateQuery = `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`;

    db.run(updateQuery, updateValues, function(err) {
      if (err) {
        console.error("❌ Database error:", err.message);
        return res.status(500).json({ success: false, error: err.message });
      }

      // Update skills if provided
      if (skills && Array.isArray(skills)) {
        updateSkills(userId, skills, res);
      } else {
        console.log("✅ Profile updated successfully");
        res.json({ success: true, message: "Profile updated successfully" });
      }
    });
  } else {
    // Only update skills
    if (skills && Array.isArray(skills)) {
      updateSkills(userId, skills, res);
    } else {
      res.json({ success: true, message: "No changes made" });
    }
  }
});

// Helper function to update skills
const updateSkills = (userId, skills, res) => {
  // Delete existing skills
  db.run("DELETE FROM user_skills WHERE user_id = ?", [userId], (err) => {
    if (err) {
      console.error("❌ Error deleting skills:", err.message);
      return res.status(500).json({ success: false, error: err.message });
    }

    // Insert new skills
    if (skills && skills.length > 0) {
      const stmt = db.prepare("INSERT INTO user_skills (user_id, skill_name, skill_level) VALUES (?, ?, ?)");
      
      skills.forEach(skill => {
        stmt.run([userId, skill.name, skill.level || 'Intermediate']);
      });
      
      stmt.finalize();
    }

    console.log("✅ Profile and skills updated successfully");
    res.json({ success: true, message: "Profile updated successfully" });
  });
};

// Setup user role (for new users)
router.post("/setup-role", (req, res) => {
  const { role, department, skills } = req.body;
  const userId = req.user.id;

  console.log(`📝 Setting up role for user: ${userId}, Role: ${role}`);

  const validRoles = ['UI Developer', 'Frontend Developer', 'Backend Developer', 
                      'Full Stack Developer', 'Tester', 'DevOps', 'Product Owner', 
                      'Scrum Master', 'Designer', 'Project Manager'];

  if (!validRoles.includes(role)) {
    return res.status(400).json({ 
      success: false, 
      error: "Invalid role selected. Please choose a valid role." 
    });
  }

  // Update user role and department
  db.run(
    "UPDATE users SET role = ?, department = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [role, department || null, userId],
    function(err) {
      if (err) {
        console.error("❌ Database error:", err.message);
        return res.status(500).json({ success: false, error: err.message });
      }

      // Add skills if provided
      if (skills && Array.isArray(skills) && skills.length > 0) {
        const stmt = db.prepare("INSERT INTO user_skills (user_id, skill_name, skill_level) VALUES (?, ?, ?)");
        
        skills.forEach(skill => {
          stmt.run([userId, skill.name, skill.level || 'Intermediate']);
        });
        
        stmt.finalize();
      }

      // Get updated user
      db.get("SELECT id, name, email, role FROM users WHERE id = ?", [userId], (err, user) => {
        if (err) {
          console.error("❌ Error fetching updated user:", err.message);
          return res.status(500).json({ success: false, error: err.message });
        }
        
        console.log("✅ Role setup completed successfully");
        res.json({ 
          success: true, 
          message: "Role setup completed successfully",
          user: user
        });
      });
    }
  );
});

// Add a single skill
router.post("/:userId/skills", (req, res) => {
  const { userId } = req.params;
  const { skillName, skillLevel } = req.body;
  const currentUserId = req.user.id;

  if (parseInt(currentUserId) !== parseInt(userId)) {
    return res.status(403).json({ success: false, error: "Permission denied" });
  }

  if (!skillName || !skillName.trim()) {
    return res.status(400).json({ success: false, error: "Skill name is required" });
  }

  db.run(
    "INSERT INTO user_skills (user_id, skill_name, skill_level) VALUES (?, ?, ?)",
    [userId, skillName.trim(), skillLevel || 'Intermediate'],
    function(err) {
      if (err) {
        console.error("❌ Error adding skill:", err.message);
        return res.status(500).json({ success: false, error: err.message });
      }

      res.status(201).json({
        success: true,
        message: "Skill added successfully",
        skill: { id: this.lastID, name: skillName, level: skillLevel || 'Intermediate' }
      });
    }
  );
});

// Remove a skill
router.delete("/:userId/skills/:skillId", (req, res) => {
  const { userId, skillId } = req.params;
  const currentUserId = req.user.id;

  if (parseInt(currentUserId) !== parseInt(userId)) {
    return res.status(403).json({ success: false, error: "Permission denied" });
  }

  db.run(
    "DELETE FROM user_skills WHERE id = ? AND user_id = ?",
    [skillId, userId],
    function(err) {
      if (err) {
        console.error("❌ Error removing skill:", err.message);
        return res.status(500).json({ success: false, error: err.message });
      }

      res.json({ success: true, message: "Skill removed successfully" });
    }
  );
});

module.exports = router;