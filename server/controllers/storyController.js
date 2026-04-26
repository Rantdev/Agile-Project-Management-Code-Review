const db = require("../config/db");

// Get stories by project with tasks
exports.getStoriesByProject = (req, res) => {
  const { projectId } = req.params;

  console.log("Fetching stories for project:", projectId);

  try {
    const stories = db.prepare(`
      SELECT * FROM stories WHERE project_id = ? ORDER BY created_at DESC
    `).all(projectId);
    
    // Get tasks for each story
    for (const story of stories) {
      const tasks = db.prepare(`
        SELECT id, title, status, assignee, deadline 
        FROM tasks WHERE story_id = ? 
        ORDER BY deadline ASC
      `).all(story.id);
      
      story.tasks = tasks || [];
      story.taskCount = tasks.length;
      story.completedTasks = tasks.filter(t => t.status === "Done").length;
    }
    
    console.log(`Found ${stories.length} stories with tasks`);
    res.json({ success: true, stories: stories || [] });
  } catch (err) {
    console.error("Error fetching stories:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get single story with tasks
exports.getStoryById = (req, res) => {
  const { id } = req.params;

  console.log("Fetching story details:", id);

  try {
    const story = db.prepare(`
      SELECT s.*, p.title as project_title, p.id as project_id
      FROM stories s
      JOIN projects p ON s.project_id = p.id
      WHERE s.id = ?
    `).get(id);
    
    if (!story) {
      return res.status(404).json({ success: false, error: "Story not found" });
    }
    
    const tasks = db.prepare(`
      SELECT * FROM tasks WHERE story_id = ? ORDER BY deadline ASC
    `).all(id);
    
    story.tasks = tasks || [];
    story.taskCount = tasks.length;
    story.completedTasks = tasks.filter(t => t.status === "Done").length;
    
    res.json({ success: true, story });
  } catch (err) {
    console.error("Error fetching story:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Create story
exports.createStory = (req, res) => {
  const { project_id, title, description, status } = req.body;

  if (!project_id || !title) {
    return res.status(400).json({ success: false, error: "Project ID and title are required" });
  }

  try {
    const result = db.prepare(`
      INSERT INTO stories (project_id, title, description, status) 
      VALUES (?, ?, ?, ?)
    `).run(project_id, title, description || "", status || "To Do");
    
    console.log("Story created with ID:", result.lastInsertRowid);
    
    res.status(201).json({
      success: true,
      message: "Story created successfully",
      story: { 
        id: result.lastInsertRowid, 
        project_id, 
        title, 
        description, 
        status: status || "To Do",
        tasks: [],
        taskCount: 0,
        completedTasks: 0
      }
    });
  } catch (err) {
    console.error("Error creating story:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update story
exports.updateStory = (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;

  try {
    db.prepare(`
      UPDATE stories SET title = ?, description = ?, status = ? WHERE id = ?
    `).run(title, description, status, id);
    
    res.json({ success: true, message: "Story updated successfully" });
  } catch (err) {
    console.error("Error updating story:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete story
exports.deleteStory = (req, res) => {
  const { id } = req.params;

  try {
    db.prepare(`DELETE FROM stories WHERE id = ?`).run(id);
    res.json({ success: true, message: "Story deleted successfully" });
  } catch (err) {
    console.error("Error deleting story:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = exports;