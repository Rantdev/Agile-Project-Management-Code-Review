const sqlite3 = require("sqlite3").verbose();
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

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("? Database connection failed:", err.message);
  } else {
    console.log("? Connected to SQLite database");
  }
});

db.run("PRAGMA foreign_keys = ON");

module.exports = db;
