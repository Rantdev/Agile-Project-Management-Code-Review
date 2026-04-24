const cron = require("node-cron");
const db = require("../config/db");
const { sendTaskEmail } = require("../controllers/emailController");

// Run daily at 9 AM
cron.schedule("0 9 * * *", () => {
  console.log("🕐 Running overdue task check...");

  db.all(
    `
    SELECT t.*, s.title as story_title, p.title as project_title
    FROM tasks t
    JOIN stories s ON t.story_id = s.id
    JOIN projects p ON s.project_id = p.id
    WHERE date(t.deadline) < date('now') AND t.status != 'Done'
    `,
    [],
    (err, tasks) => {
      if (err) {
        console.error("❌ Overdue task check error:", err.message);
        return;
      }

      console.log(`📧 Found ${tasks.length} overdue tasks`);

      tasks.forEach((task) => {
        sendTaskEmail(
          task.assignee,
          "⚠️ Task Overdue Reminder",
          `Your task "${task.title}" (Project: ${task.project_title}) is overdue. Please complete it as soon as possible.\n\nDeadline was: ${task.deadline}`
        ).catch(err => console.error(`Failed to send reminder for task ${task.id}:`, err));
      });
    }
  );
});

console.log("✅ Reminder job scheduled (runs daily at 9 AM)");