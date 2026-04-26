const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const db = require("../config/db");

router.use(protect);

// Get chat messages for a project
router.get("/:projectId", (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;
  const userEmail = req.user.email;

  console.log(`Fetching chat messages for project: ${projectId}`);

  try {
    // Check if user has access to this project
    const project = db.prepare(`
      SELECT id FROM projects 
      WHERE id = ? AND (created_by = ? OR id IN (
        SELECT project_id FROM team_members WHERE project_id = ? AND user_email = ?
      ))
    `).get(projectId, userId, projectId, userEmail);
    
    if (!project) {
      return res.status(403).json({ success: false, error: "You don't have access to this project" });
    }

    const messages = db.prepare(`
      SELECT * FROM chat_messages 
      WHERE project_id = ? 
      ORDER BY created_at ASC 
      LIMIT 100
    `).all(projectId);
    
    console.log(`Found ${messages.length} messages`);
    res.json({ success: true, messages: messages || [] });
  } catch (err) {
    console.error("Error fetching messages:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Send a chat message
router.post("/:projectId", (req, res) => {
  const { projectId } = req.params;
  const { message } = req.body;
  const userId = req.user.id;
  const userEmail = req.user.email;
  const userName = req.user.name || userEmail.split('@')[0];

  console.log(`Sending message to project: ${projectId}`);

  if (!message || message.trim() === "") {
    return res.status(400).json({ success: false, error: "Message is required" });
  }

  try {
    // Check if user has access to this project
    const project = db.prepare(`
      SELECT id FROM projects 
      WHERE id = ? AND (created_by = ? OR id IN (
        SELECT project_id FROM team_members WHERE project_id = ? AND user_email = ?
      ))
    `).get(projectId, userId, projectId, userEmail);
    
    if (!project) {
      return res.status(403).json({ success: false, error: "You don't have access to this project" });
    }

    // Insert message
    const result = db.prepare(`
      INSERT INTO chat_messages (project_id, user_id, user_name, user_email, message) 
      VALUES (?, ?, ?, ?, ?)
    `).run(projectId, userId, userName, userEmail, message.trim());
    
    // Get the inserted message
    const newMessage = db.prepare(`
      SELECT * FROM chat_messages WHERE id = ?
    `).get(result.lastInsertRowid);
    
    console.log(`Message sent successfully: ID ${result.lastInsertRowid}`);
    
    res.status(201).json({
      success: true,
      message: "Message sent",
      chatMessage: newMessage
    });
  } catch (err) {
    console.error("Error sending message:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete a chat message
router.delete("/:messageId", (req, res) => {
  const { messageId } = req.params;
  const userId = req.user.id;

  console.log(`Deleting message: ${messageId}`);

  try {
    // Check if user owns the message
    const message = db.prepare(`
      SELECT user_id FROM chat_messages WHERE id = ?
    `).get(messageId);
    
    if (!message) {
      return res.status(404).json({ success: false, error: "Message not found" });
    }
    
    if (message.user_id !== userId) {
      return res.status(403).json({ success: false, error: "You can only delete your own messages" });
    }

    db.prepare(`DELETE FROM chat_messages WHERE id = ?`).run(messageId);
    
    console.log(`Message ${messageId} deleted`);
    res.json({ success: true, message: "Message deleted" });
  } catch (err) {
    console.error("Error deleting message:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;