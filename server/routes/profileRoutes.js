const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const db = require("../config/db");

router.use(protect);

// Get user profile
router.get("/:userId", (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user.id;

  if (parseInt(currentUserId) !== parseInt(userId)) {
    return res.status(403).json({ success: false, error: "You can only view your own profile" });
  }

  try {
    const profile = db.prepare("SELECT id, name, email, role, created_at FROM users WHERE id = ?").get(userId);
    
    if (!profile) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update user profile
router.put("/:userId", (req, res) => {
  const { userId } = req.params;
  const { name, phone, location } = req.body;
  const currentUserId = req.user.id;

  if (parseInt(currentUserId) !== parseInt(userId)) {
    return res.status(403).json({ success: false, error: "You can only update your own profile" });
  }

  try {
    if (name) db.prepare("UPDATE users SET name = ? WHERE id = ?").run(name, userId);
    if (phone) db.prepare("UPDATE users SET phone = ? WHERE id = ?").run(phone, userId);
    if (location) db.prepare("UPDATE users SET location = ? WHERE id = ?").run(location, userId);
    
    res.json({ success: true, message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Setup user role
router.post("/setup-role", (req, res) => {
  const { role, department } = req.body;
  const userId = req.user.id;

  console.log("Setting up role for user:", userId, "Role:", role);

  const validRoles = ['UI Developer', 'Frontend Developer', 'Backend Developer', 
                      'Full Stack Developer', 'Tester', 'DevOps', 'Product Owner', 
                      'Scrum Master', 'Designer', 'Project Manager'];

  if (!validRoles.includes(role)) {
    return res.status(400).json({ success: false, error: "Invalid role selected" });
  }

  try {
    // Check if user exists
    const user = db.prepare("SELECT id FROM users WHERE id = ?").get(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Update user role
    db.prepare("UPDATE users SET role = ?, department = ? WHERE id = ?").run(role, department || null, userId);

    // Get updated user
    const updatedUser = db.prepare("SELECT id, name, email, role FROM users WHERE id = ?").get(userId);
    
    console.log("Role setup successful for user:", updatedUser);
    res.json({ 
      success: true, 
      message: "Role setup completed",
      user: updatedUser
    });
  } catch (err) {
    console.error("Database error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;