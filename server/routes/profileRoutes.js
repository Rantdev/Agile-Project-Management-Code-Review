const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const db = require("../config/db");

router.get("/:userId", protect, (req, res) => {
  const { userId } = req.params;
  
  try {
    const user = db.prepare("SELECT id, name, email, role, created_at FROM users WHERE id = ?").get(userId);
    res.json({ success: true, profile: user || {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;