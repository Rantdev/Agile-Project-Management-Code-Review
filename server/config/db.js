const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

// Use Render's writable directory for production, or local path for development
const dbPath = process.env.DB_PATH || path.join(__dirname, "../../database/agile.db");

// Ensure directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

console.log("📂 Database path:", dbPath);

// Create database connection (synchronous)
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log("✅ Connected to SQLite database");

module.exports = db;
