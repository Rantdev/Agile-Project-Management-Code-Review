const db = require("../config/db");
const { sendTaskEmail } = require("./emailController");

// Create task with email notification
exports.createTask = (req, res) => {
  const { story_id, title, assignee, deadline, status } = req.body;
  const created_by = req.user.id;
  const creatorName = req.user.name || req.user.email;

  if (!story_id || !title) {
    return res.status(400).json({ success: false, error: "Story ID and title are required" });
  }

  try {
    // Get story and project info for email
    const storyInfo = db.prepare(`
      SELECT s.title as story_title, p.title as project_title, p.id as project_id
      FROM stories s
      JOIN projects p ON s.project_id = p.id
      WHERE s.id = ?
    `).get(story_id);
    
    // Get assignee name
    const assigneeInfo = db.prepare(`SELECT name FROM users WHERE email = ?`).get(assignee);
    
    const result = db.prepare(`
      INSERT INTO tasks (story_id, title, assignee, deadline, status, created_by) 
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(story_id, title, assignee, deadline || null, status || "To Do", created_by);
    
    // Send email notification if assignee exists
    if (assignee && assigneeInfo) {
      sendTaskEmail(assignee, "New Task Assigned - AgileFlow", `You have been assigned a new task: "${title}"`, {
        taskTitle: title,
        storyTitle: storyInfo?.story_title,
        projectTitle: storyInfo?.project_title,
        deadline: deadline,
        assignerName: creatorName,
        assigneeName: assigneeInfo?.name
      });
    }
    
    res.status(201).json({
      success: true,
      message: "Task created successfully" + (assignee ? " Email notification sent." : ""),
      task: { id: result.lastInsertRowid, story_id, title, assignee, deadline, status }
    });
  } catch (err) {
    console.error("Error creating task:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get my tasks (assigned to current user)
exports.getMyTasks = (req, res) => {
  const userEmail = req.user.email;

  console.log("Fetching tasks for user:", userEmail);

  try {
    const tasks = db.prepare(`
      SELECT t.*, s.title as story_title, p.title as project_title, p.id as project_id
      FROM tasks t
      JOIN stories s ON t.story_id = s.id
      JOIN projects p ON s.project_id = p.id
      WHERE t.assignee = ?
      ORDER BY 
        CASE WHEN t.status = 'Done' THEN 2 ELSE 1 END,
        t.deadline ASC
    `).all(userEmail);
    
    console.log(`Found ${tasks.length} tasks for user ${userEmail}`);
    res.json({ success: true, tasks: tasks || [] });
  } catch (err) {
    console.error("Error fetching tasks:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get tasks by story
exports.getTasksByStory = (req, res) => {
  const { storyId } = req.params;

  try {
    const tasks = db.prepare(`
      SELECT * FROM tasks WHERE story_id = ? ORDER BY deadline ASC
    `).all(storyId);
    
    res.json({ success: true, tasks: tasks || [] });
  } catch (err) {
    console.error("Error fetching tasks by story:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update task
exports.updateTask = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    db.prepare(`UPDATE tasks SET status = ? WHERE id = ?`).run(status, id);
    res.json({ success: true, message: "Task updated successfully" });
  } catch (err) {
    console.error("Error updating task:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete task
exports.deleteTask = (req, res) => {
  const { id } = req.params;

  try {
    db.prepare(`DELETE FROM tasks WHERE id = ?`).run(id);
    res.json({ success: true, message: "Task deleted successfully" });
  } catch (err) {
    console.error("Error deleting task:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = exports;