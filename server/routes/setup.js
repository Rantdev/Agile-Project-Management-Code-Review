const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Endpoint to create chat_messages table
router.get("/create-chat-table", (req, res) => {
  console.log("Creating chat_messages table...");

  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        user_name TEXT NOT NULL,
        user_email TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    console.log("✅ Chat messages table created successfully");
    res.json({ 
      success: true, 
      message: "Chat messages table created successfully" 
    });
  } catch (err) {
    console.error("❌ Error creating chat table:", err.message);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Endpoint to check if table exists
router.get("/check-chat-table", (req, res) => {
  try {
    const table = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='chat_messages'
    `).get();
    
    res.json({ 
      success: true, 
      exists: !!table,
      message: table ? "Table exists" : "Table does not exist"
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;