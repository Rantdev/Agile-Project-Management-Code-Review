const db = require("../config/db");

// Get all projects for user (owner + team member)
exports.getProjects = (req, res) => {
  const userId = req.user.id;
  const userEmail = req.user.email;

  console.log(`Fetching projects for user: ${userId}, email: ${userEmail}`);

  try {
    const projects = db.prepare(`
      SELECT DISTINCT 
        p.id, p.title, p.description, p.status, p.created_by, p.created_at,
        CASE 
          WHEN p.created_by = ? THEN 'owner' 
          ELSE 'member' 
        END as role,
        (SELECT COUNT(*) FROM team_members WHERE project_id = p.id) as team_count,
        (SELECT COUNT(*) FROM stories WHERE project_id = p.id) as story_count
      FROM projects p
      LEFT JOIN team_members tm ON p.id = tm.project_id
      WHERE p.created_by = ? OR tm.user_email = ?
      ORDER BY p.created_at DESC
    `).all(userId, userId, userEmail);
    
    console.log(`Found ${projects.length} projects for user ${userEmail}`);
    res.json({ success: true, projects: projects || [] });
  } catch (err) {
    console.error("Error fetching projects:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get single project (check access)
exports.getProjectById = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userEmail = req.user.email;

  try {
    const project = db.prepare(`
      SELECT p.* FROM projects p
      LEFT JOIN team_members tm ON p.id = tm.project_id
      WHERE p.id = ? AND (p.created_by = ? OR tm.user_email = ?)
    `).get(id, userId, userEmail);
    
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found or you don't have access" });
    }
    
    res.json({ success: true, project });
  } catch (err) {
    console.error("Error fetching project:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Create project
exports.createProject = (req, res) => {
  const { title, description, status } = req.body;
  const created_by = req.user.id;

  if (!title) {
    return res.status(400).json({ success: false, error: "Project title is required" });
  }

  try {
    const result = db.prepare(`
      INSERT INTO projects (title, description, status, created_by) 
      VALUES (?, ?, ?, ?)
    `).run(title, description || "", status || "Planning", created_by);
    
    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project: { 
        id: result.lastInsertRowid, 
        title, 
        description, 
        status: status || "Planning", 
        created_by 
      }
    });
  } catch (err) {
    console.error("Error creating project:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update project
exports.updateProject = (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;
  const userId = req.user.id;

  try {
    const project = db.prepare(`SELECT created_by FROM projects WHERE id = ?`).get(id);
    
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }
    
    if (project.created_by !== userId) {
      return res.status(403).json({ success: false, error: "Only project owner can update" });
    }

    db.prepare(`UPDATE projects SET title = ?, description = ?, status = ? WHERE id = ?`)
      .run(title, description, status, id);
    
    res.json({ success: true, message: "Project updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete project
exports.deleteProject = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const project = db.prepare(`SELECT created_by FROM projects WHERE id = ?`).get(id);
    
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }
    
    if (project.created_by !== userId) {
      return res.status(403).json({ success: false, error: "Only project owner can delete" });
    }

    db.prepare(`DELETE FROM projects WHERE id = ?`).run(id);
    
    res.json({ success: true, message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = exports;