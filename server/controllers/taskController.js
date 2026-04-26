const db = require("../config/db");
const { sendTaskEmail } = require("./emailController");

// Create task with proper error logging
exports.createTask = (req, res) => {
  const { story_id, title, assignee, deadline, status } = req.body;
  const created_by = req.user.id;
  const creatorName = req.user.name || req.user.email;

  console.log("Creating task with data:", { story_id, title, assignee, deadline });

  if (!story_id || !title) {
    return res.status(400).json({ success: false, error: "Story ID and title are required" });
  }

  try {
    // First verify the story exists
    const story = db.prepare("SELECT id, project_id FROM stories WHERE id = ?").get(story_id);
    
    if (!story) {
      console.log("Story not found with ID:", story_id);
      return res.status(404).json({ success: false, error: "Story not found" });
    }

    console.log("Found story:", story);

    // Get assignee name if assignee provided
    let assigneeInfo = null;
    if (assignee) {
      assigneeInfo = db.prepare(`SELECT name FROM users WHERE email = ?`).get(assignee);
    }
    
    const result = db.prepare(`
      INSERT INTO tasks (story_id, title, assignee, deadline, status, created_by) 
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(story_id, title, assignee || null, deadline || null, status || "To Do", created_by);
    
    console.log("Task created with ID:", result.lastInsertRowid);
    
    // Send email notification if assignee exists
    if (assignee && assigneeInfo) {
      const projectInfo = db.prepare(`SELECT title FROM projects WHERE id = ?`).get(story.project_id);
      sendTaskEmail(assignee, "New Task Assigned - AgileFlow", `You have been assigned: ${title}`, {
        taskTitle: title,
        assigneeName: assigneeInfo.name,
        projectTitle: projectInfo?.title
      });
    }
    
    // Get the created task to return
    const newTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(result.lastInsertRowid);
    
    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: newTask
    });
  } catch (err) {
    console.error("Error creating task:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get tasks by story (ensure this is working)
exports.getTasksByStory = (req, res) => {
  const { storyId } = req.params;

  console.log("Fetching tasks for story ID:", storyId);

  try {
    // First check if story exists
    const story = db.prepare("SELECT id, title FROM stories WHERE id = ?").get(storyId);
    
    if (!story) {
      console.log("Story not found:", storyId);
      return res.status(404).json({ success: false, error: "Story not found" });
    }

    const tasks = db.prepare(`
      SELECT * FROM tasks WHERE story_id = ? ORDER BY deadline ASC
    `).all(storyId);
    
    console.log(`Found ${tasks.length} tasks for story "${story.title}"`);
    res.json({ success: true, tasks: tasks || [] });
  } catch (err) {
    console.error("Error fetching tasks by story:", err.message);
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

// Update task
exports.updateTask = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  console.log("Updating task:", id, "to status:", status);

  try {
    const task = db.prepare("SELECT id FROM tasks WHERE id = ?").get(id);
    
    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    db.prepare(`UPDATE tasks SET status = ? WHERE id = ?`).run(status, id);
    
    const updatedTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
    
    res.json({ success: true, message: "Task updated successfully", task: updatedTask });
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