const db = require("../config/db");

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

    console.log("✅ Skills updated successfully");
    if (res) {
      res.json({ success: true, message: "Profile updated successfully" });
    }
  });
};

// @desc    Get user profile
// @route   GET /api/profile/:userId
exports.getProfile = (req, res) => {
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

  // Get all columns safely with COALESCE for null values
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
};

// @desc    Update user profile
// @route   PUT /api/profile/:userId
exports.updateProfile = (req, res) => {
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

  if (updateFields.length === 0 && (!skills || skills.length === 0)) {
    return res.json({ success: true, message: "No changes made" });
  }

  // Update profile fields if any
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
};

// @desc    Upload avatar
// @route   POST /api/profile/avatar
exports.uploadAvatar = (req, res) => {
  const { avatarUrl } = req.body;
  const userId = req.user.id;

  console.log(`📝 Uploading avatar for user: ${userId}`);

  if (!avatarUrl) {
    return res.status(400).json({ 
      success: false, 
      error: "Avatar URL is required" 
    });
  }

  db.run("UPDATE users SET avatar = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", 
    [avatarUrl, userId], 
    function(err) {
      if (err) {
        console.error("❌ Database error:", err.message);
        return res.status(500).json({ success: false, error: err.message });
      }
      
      console.log("✅ Avatar updated successfully");
      res.json({ success: true, avatar: avatarUrl, message: "Avatar updated successfully" });
    }
  );
};

// @desc    Setup user role (called during registration)
// @route   POST /api/profile/setup-role
exports.setupUserRole = (req, res) => {
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

      console.log("✅ Role setup completed successfully");
      res.json({ 
        success: true, 
        message: "Role setup completed successfully",
        user: { role, department }
      });
    }
  );
};

// @desc    Add a single skill to user
// @route   POST /api/profile/:userId/skills
exports.addSkill = (req, res) => {
  const { userId } = req.params;
  const { skillName, skillLevel } = req.body;
  const currentUserId = req.user.id;

  console.log(`📝 Adding skill for user: ${userId}`);

  if (parseInt(currentUserId) !== parseInt(userId)) {
    return res.status(403).json({ 
      success: false, 
      error: "You can only add skills to your own profile" 
    });
  }

  if (!skillName || !skillName.trim()) {
    return res.status(400).json({ 
      success: false, 
      error: "Skill name is required" 
    });
  }

  db.run(
    "INSERT INTO user_skills (user_id, skill_name, skill_level) VALUES (?, ?, ?)",
    [userId, skillName.trim(), skillLevel || 'Intermediate'],
    function(err) {
      if (err) {
        console.error("❌ Database error:", err.message);
        return res.status(500).json({ success: false, error: err.message });
      }

      console.log("✅ Skill added successfully");
      res.status(201).json({
        success: true,
        message: "Skill added successfully",
        skill: {
          id: this.lastID,
          name: skillName,
          level: skillLevel || 'Intermediate'
        }
      });
    }
  );
};

// @desc    Remove a skill from user
// @route   DELETE /api/profile/:userId/skills/:skillId
exports.removeSkill = (req, res) => {
  const { userId, skillId } = req.params;
  const currentUserId = req.user.id;

  console.log(`📝 Removing skill ${skillId} for user: ${userId}`);

  if (parseInt(currentUserId) !== parseInt(userId)) {
    return res.status(403).json({ 
      success: false, 
      error: "You can only remove skills from your own profile" 
    });
  }

  db.run(
    "DELETE FROM user_skills WHERE id = ? AND user_id = ?",
    [skillId, userId],
    function(err) {
      if (err) {
        console.error("❌ Database error:", err.message);
        return res.status(500).json({ success: false, error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ 
          success: false, 
          error: "Skill not found" 
        });
      }

      console.log("✅ Skill removed successfully");
      res.json({
        success: true,
        message: "Skill removed successfully"
      });
    }
  );
};

// @desc    Update a skill
// @route   PUT /api/profile/:userId/skills/:skillId
exports.updateSkill = (req, res) => {
  const { userId, skillId } = req.params;
  const { skillName, skillLevel } = req.body;
  const currentUserId = req.user.id;

  console.log(`📝 Updating skill ${skillId} for user: ${userId}`);

  if (parseInt(currentUserId) !== parseInt(userId)) {
    return res.status(403).json({ 
      success: false, 
      error: "You can only update your own skills" 
    });
  }

  const updates = [];
  const values = [];

  if (skillName && skillName.trim()) {
    updates.push("skill_name = ?");
    values.push(skillName.trim());
  }
  if (skillLevel) {
    updates.push("skill_level = ?");
    values.push(skillLevel);
  }

  if (updates.length === 0) {
    return res.status(400).json({ 
      success: false, 
      error: "No fields to update" 
    });
  }

  values.push(skillId, userId);
  const query = `UPDATE user_skills SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`;

  db.run(query, values, function(err) {
    if (err) {
      console.error("❌ Database error:", err.message);
      return res.status(500).json({ success: false, error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ 
        success: false, 
        error: "Skill not found" 
      });
    }

    console.log("✅ Skill updated successfully");
    res.json({
      success: true,
      message: "Skill updated successfully"
    });
  });
};

// @desc    Get all skills (for autocomplete)
// @route   GET /api/profile/skills/common
exports.getCommonSkills = (req, res) => {
  console.log("📝 Fetching common skills");

  const query = `
    SELECT skill_name, COUNT(*) as count 
    FROM user_skills 
    GROUP BY skill_name 
    ORDER BY count DESC 
    LIMIT 50
  `;

  db.all(query, [], (err, skills) => {
    if (err) {
      console.error("❌ Database error:", err.message);
      return res.status(500).json({ success: false, error: err.message });
    }

    console.log(`✅ Found ${skills.length} common skills`);
    res.json({
      success: true,
      skills: skills.map(s => s.skill_name)
    });
  });
};

// @desc    Get user statistics
// @route   GET /api/profile/:userId/stats
exports.getUserStats = (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user.id;

  if (parseInt(currentUserId) !== parseInt(userId)) {
    return res.status(403).json({ 
      success: false, 
      error: "You can only view your own stats" 
    });
  }

  const query = `
    SELECT 
      (SELECT COUNT(*) FROM tasks WHERE assignee = (SELECT email FROM users WHERE id = ?)) as total_tasks,
      (SELECT COUNT(*) FROM tasks WHERE assignee = (SELECT email FROM users WHERE id = ?) AND status = 'Done') as completed_tasks,
      (SELECT COUNT(*) FROM tasks WHERE assignee = (SELECT email FROM users WHERE id = ?) AND status = 'In Progress') as in_progress_tasks,
      (SELECT COUNT(*) FROM projects WHERE created_by = ?) as projects_created,
      (SELECT COUNT(*) FROM team_members WHERE user_email = (SELECT email FROM users WHERE id = ?)) as teams_joined
  `;

  db.get(query, [userId, userId, userId, userId, userId], (err, stats) => {
    if (err) {
      console.error("❌ Database error:", err.message);
      return res.status(500).json({ success: false, error: err.message });
    }

    res.json({
      success: true,
      stats: {
        total_tasks: stats?.total_tasks || 0,
        completed_tasks: stats?.completed_tasks || 0,
        in_progress_tasks: stats?.in_progress_tasks || 0,
        completion_rate: stats?.total_tasks > 0 
          ? Math.round((stats.completed_tasks / stats.total_tasks) * 100) 
          : 0,
        projects_created: stats?.projects_created || 0,
        teams_joined: stats?.teams_joined || 0
      }
    });
  });
};