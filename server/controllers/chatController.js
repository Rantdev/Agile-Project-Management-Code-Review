const db = require("../config/db");

// @desc    Get messages for a project
// @route   GET /api/chat/:projectId
exports.getMessages = (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;

  db.get(
    `SELECT id FROM projects 
     WHERE id = ? AND (created_by = ? OR id IN (
       SELECT project_id FROM team_members WHERE project_id = ? AND user_email = ?
     ))`,
    [projectId, userId, projectId, req.user.email],
    (err, project) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      if (!project) {
        return res.status(403).json({ 
          success: false, 
          error: "You don't have access to this project" 
        });
      }

      db.all(
        `SELECT * FROM chat_messages 
         WHERE project_id = ? 
         ORDER BY created_at ASC 
         LIMIT 100`,
        [projectId],
        (err, messages) => {
          if (err) {
            return res.status(500).json({ success: false, error: err.message });
          }
          res.json({ success: true, messages: messages || [] });
        }
      );
    }
  );
};

// @desc    Send message
// @route   POST /api/chat/:projectId
exports.sendMessage = (req, res) => {
  const { projectId } = req.params;
  const { message, fileUrl } = req.body;
  const userId = req.user.id;
  const userEmail = req.user.email;

  if (!message && !fileUrl) {
    return res.status(400).json({ 
      success: false, 
      error: "Message or file is required" 
    });
  }

  db.get("SELECT name, avatar FROM users WHERE id = ?", [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }

    db.run(
      `INSERT INTO chat_messages (project_id, user_id, user_name, user_email, user_avatar, message, file_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [projectId, userId, user.name, userEmail, user.avatar || null, message || null, fileUrl || null],
      function(err) {
        if (err) {
          return res.status(500).json({ success: false, error: err.message });
        }

        res.status(201).json({
          success: true,
          message: "Message sent",
          chatMessage: {
            id: this.lastID,
            project_id: projectId,
            user_id: userId,
            user_name: user.name,
            user_email: userEmail,
            user_avatar: user.avatar,
            message,
            file_url: fileUrl,
            created_at: new Date().toISOString()
          }
        });
      }
    );
  });
};

// @desc    Delete message
// @route   DELETE /api/chat/:messageId
exports.deleteMessage = (req, res) => {
  const { messageId } = req.params;
  const userId = req.user.id;

  db.get("SELECT user_id FROM chat_messages WHERE id = ?", [messageId], (err, message) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    if (!message) {
      return res.status(404).json({ success: false, error: "Message not found" });
    }
    if (message.user_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: "You can only delete your own messages" 
      });
    }

    db.run("DELETE FROM chat_messages WHERE id = ?", [messageId], function(err) {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      res.json({ success: true, message: "Message deleted" });
    });
  });
};