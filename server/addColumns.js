const db = require("./config/db");

const addColumns = () => {
  console.log("Adding missing columns...");

  // Add created_by to stories table
  db.run(`ALTER TABLE stories ADD COLUMN created_by INTEGER`, (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      console.log("Error adding created_by to stories:", err.message);
    } else {
      console.log("✅ Added created_by to stories table");
    }
  });

  // Add created_by to tasks table
  db.run(`ALTER TABLE tasks ADD COLUMN created_by INTEGER`, (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      console.log("Error adding created_by to tasks:", err.message);
    } else {
      console.log("✅ Added created_by to tasks table");
    }
  });

  // Add updated_at to stories if not exists
  db.run(`ALTER TABLE stories ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`, (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      // Ignore
    } else {
      console.log("✅ stories.updated_at ready");
    }
  });

  // Add updated_at to tasks if not exists
  db.run(`ALTER TABLE tasks ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`, (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      // Ignore
    } else {
      console.log("✅ tasks.updated_at ready");
    }
  });

  setTimeout(() => {
    console.log("\n✅ Database schema update complete!");
    process.exit(0);
  }, 2000);
};

addColumns();