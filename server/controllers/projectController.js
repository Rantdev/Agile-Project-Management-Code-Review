const db = require("../config/db");

// @desc    Create project
exports.createProject = (req, res) => {
  const { title, description, status } = req.body;
  const created_by = req.user.id;

  console.log("📝 Creating project for user:", created_by);

  if (!title || title.trim() === "") {
    return res.status(400).json({ 
      success: false, 
      error: "Project title is required" 
    });
  }

  db.run(
    "INSERT INTO projects (title, description, status, created_by) VALUES (?, ?, ?, ?)",
    [title.trim(), description || "", status || "Planning", created_by],
    function (err) {
      if (err) {
        console.error("❌ Database error:", err.message);
        return res.status(500).json({ 
          success: false, 
          error: err.message 
        });
      }

      res.status(201).json({
        success: true,
        message: "Project created successfully",
        project: { 
          id: this.lastID, 
          title, 
          description, 
          status: status || "Planning", 
          created_by 
        }
      });
    }
  );
};

// @desc    Get all projects for user
exports.getProjects = (req, res) => {
  const userId = req.user.id;
  const userEmail = req.user.email;

  console.log("📋 Fetching projects for user:", userId, userEmail);

  // Simplified query without potentially missing columns
  const query = `
    SELECT DISTINCT 
      p.id,
      p.title,
      p.description,
      p.status,
      p.created_by,
      p.created_at
    FROM projects p
    LEFT JOIN team_members tm ON p.id = tm.project_id
    WHERE p.created_by = ? OR tm.user_email = ?
    ORDER BY p.created_at DESC
  `;

  db.all(query, [userId, userEmail], (err, rows) => {
    if (err) {
      console.error("❌ Database error:", err.message);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    
    console.log(`✅ Found ${rows?.length || 0} projects`);
    res.json({ 
      success: true, 
      projects: rows || [] 
    });
  });
};

// @desc    Get single project
exports.getProjectById = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userEmail = req.user.email;

  db.get(
    `SELECT * FROM projects WHERE id = ? AND (created_by = ? OR id IN (
      SELECT project_id FROM team_members WHERE project_id = ? AND user_email = ?
    ))`,
    [id, userId, id, userEmail],
    (err, project) => {
      if (err) {
        console.error("❌ Database error:", err.message);
        return res.status(500).json({ success: false, error: err.message });
      }
      
      if (!project) {
        return res.status(404).json({ 
          success: false, 
          error: "Project not found or you don't have access" 
        });
      }
      
      res.json({ success: true, project });
    }
  );
};

// @desc    Update project
exports.updateProject = (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;

  db.run(
    "UPDATE projects SET title = ?, description = ?, status = ? WHERE id = ?",
    [title, description, status, id],
    function (err) {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ success: false, error: "Project not found" });
      }
      res.json({ success: true, message: "Project updated successfully" });
    }
  );
};

// @desc    Delete project
exports.deleteProject = (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM projects WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }
    res.json({ success: true, message: "Project deleted successfully" });
  });
};