const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

// Use Railway volume path if available
const dbPath = process.env.DB_PATH || path.join(__dirname, "../../database/agile.db");

// Ensure directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

console.log("?? Database path:", dbPath);

// better-sqlite3 is synchronous and easier for deployment
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log("? Connected to SQLite database");

module.exports = db;
