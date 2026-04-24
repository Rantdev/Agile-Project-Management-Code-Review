const db = require("./config/db");

const fixDatabase = () => {
  console.log("🔧 Fixing database schema...");

  // Add updated_at column to tasks if not exists
  db.run(`ALTER TABLE tasks ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`, (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      console.log("Note: updated_at column may already exist");
    } else {
      console.log("✅ tasks.updated_at column ready");
    }
  });

  // Add updated_at column to stories if not exists
  db.run(`ALTER TABLE stories ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`, (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      console.log("Note: updated_at column may already exist");
    } else {
      console.log("✅ stories.updated_at column ready");
    }
  });

  // Add updated_at column to projects if not exists
  db.run(`ALTER TABLE projects ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`, (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      console.log("Note: updated_at column may already exist");
    } else {
      console.log("✅ projects.updated_at column ready");
    }
  });

  setTimeout(() => {
    console.log("✅ Database schema update complete");
    process.exit(0);
  }, 2000);
};

fixDatabase();