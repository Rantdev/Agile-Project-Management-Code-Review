const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const db = require("../config/db");

router.use(protect);

router.get("/:projectId", (req, res) => {
  try {
    const messages = db.prepare("SELECT * FROM chat_messages WHERE project_id = ? ORDER BY created_at ASC LIMIT 100").all(req.params.projectId);
    res.json({ success: true, messages: messages || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/:projectId", (req, res) => {
  const { message } = req.body;
  if (!message || message.trim() === "") return res.status(400).json({ success: false, error: "Message is required" });

  try {
    const result = db.prepare("INSERT INTO chat_messages (project_id, user_id, user_name, user_email, message) VALUES (?, ?, ?, ?, ?)")
      .run(req.params.projectId, req.user.id, req.user.name, req.user.email, message);
    res.status(201).json({
      success: true,
      message: "Message sent",
      chatMessage: { id: result.lastInsertRowid, project_id: req.params.projectId, user_id: req.user.id, user_name: req.user.name, user_email: req.user.email, message, created_at: new Date().toISOString() }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/:messageId", (req, res) => {
  try {
    db.prepare("DELETE FROM chat_messages WHERE id = ?").run(req.params.messageId);
    res.json({ success: true, message: "Message deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;