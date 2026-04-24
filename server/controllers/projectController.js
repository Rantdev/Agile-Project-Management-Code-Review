const db = require("../config/db");

// @desc    Create project
// @route   POST /api/projects
exports.createProject = (req, res) => {
  const { title, description, status } = req.body;
  const created_by = req.user.id;

  console.log("📝 Creating project for user:", created_by);
  console.log("📝 Project data:", { title, description, status });

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

      const projectId = this.lastID;
      console.log("✅ Project created with ID:", projectId);

      db.get(
        "SELECT * FROM projects WHERE id = ?",
        [projectId],
        (err, project) => {
          if (err) {
            return res.status(201).json({
              success: true,
              message: "Project created successfully",
              project: { 
                id: projectId, 
                title, 
                description, 
                status: status || "Planning", 
                created_by 
              }
            });
          }
          
          res.status(201).json({
            success: true,
            message: "Project created successfully",
            project: project
          });
        }
      );
    }
  );
};

// @desc    Get all projects for user
// @route   GET /api/projects
exports.getProjects = (req, res) => {
  const userId = req.user.id;
  const userEmail = req.user.email;

  console.log("📋 Fetching projects for user:", userId, userEmail);

  // Fixed query - removed created_at ORDER BY
  const query = `
    SELECT DISTINCT 
      p.id,
      p.title,
      p.description,
      p.status,
      p.created_by,
      CASE 
        WHEN p.created_by = ? THEN 'owner' 
        ELSE 'member' 
      END as role,
      (SELECT COUNT(*) FROM team_members WHERE project_id = p.id) as team_count,
      (SELECT COUNT(*) FROM stories WHERE project_id = p.id) as story_count,
      (SELECT COUNT(*) FROM tasks t 
       JOIN stories s ON t.story_id = s.id 
       WHERE s.project_id = p.id) as task_count
    FROM projects p
    LEFT JOIN team_members tm ON p.id = tm.project_id
    WHERE p.created_by = ? OR tm.user_email = ?
  `;

  db.all(query, [userId, userId, userEmail], (err, rows) => {
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
// @route   GET /api/projects/:id
exports.getProjectById = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userEmail = req.user.email;

  console.log("📋 Fetching project details for ID:", id);

  const query = `
    SELECT p.*,
      (SELECT COUNT(*) FROM stories WHERE project_id = p.id) as story_count,
      (SELECT COUNT(*) FROM team_members WHERE project_id = p.id) as team_count,
      (SELECT COUNT(*) FROM tasks t 
       JOIN stories s ON t.story_id = s.id 
       WHERE s.project_id = p.id) as task_count
    FROM projects p
    WHERE p.id = ? AND (p.created_by = ? OR EXISTS (
      SELECT 1 FROM team_members WHERE project_id = p.id AND user_email = ?
    ))
  `;

  db.get(query, [id, userId, userEmail], (err, project) => {
    if (err) {
      console.error("❌ Database error:", err.message);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        error: "Project not found or you don't have access" 
      });
    }
    
    console.log("✅ Project found:", project.title);
    res.json({ success: true, project });
  });
};

// @desc    Update project
// @route   PUT /api/projects/:id
exports.updateProject = (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;
  const userId = req.user.id;

  console.log("✏️ Updating project ID:", id);

  db.get(
    "SELECT created_by FROM projects WHERE id = ?",
    [id],
    (err, project) => {
      if (err) {
        console.error("❌ Database error:", err.message);
        return res.status(500).json({ 
          success: false, 
          error: err.message 
        });
      }
      
      if (!project) {
        return res.status(404).json({ 
          success: false, 
          error: "Project not found" 
        });
      }
      
      if (project.created_by !== userId) {
        return res.status(403).json({ 
          success: false, 
          error: "You don't have permission to update this project" 
        });
      }

      db.run(
        `UPDATE projects 
         SET title = COALESCE(?, title), 
             description = COALESCE(?, description), 
             status = COALESCE(?, status)
         WHERE id = ?`,
        [title, description, status, id],
        function (err) {
          if (err) {
            console.error("❌ Database error:", err.message);
            return res.status(500).json({ 
              success: false, 
              error: err.message 
            });
          }
          
          console.log("✅ Project updated successfully");
          res.json({ 
            success: true, 
            message: "Project updated successfully" 
          });
        }
      );
    }
  );
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
exports.deleteProject = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  console.log("🗑️ Deleting project ID:", id);

  db.get(
    "SELECT created_by FROM projects WHERE id = ?",
    [id],
    (err, project) => {
      if (err) {
        console.error("❌ Database error:", err.message);
        return res.status(500).json({ 
          success: false, 
          error: err.message 
        });
      }
      
      if (!project) {
        return res.status(404).json({ 
          success: false, 
          error: "Project not found" 
        });
      }
      
      if (project.created_by !== userId) {
        return res.status(403).json({ 
          success: false, 
          error: "You don't have permission to delete this project" 
        });
      }

      db.run("DELETE FROM projects WHERE id = ?", [id], function (err) {
        if (err) {
          console.error("❌ Database error:", err.message);
          return res.status(500).json({ 
            success: false, 
            error: err.message 
          });
        }
        
        console.log("✅ Project deleted successfully");
        res.json({ 
          success: true, 
          message: "Project deleted successfully" 
        });
      });
    }
  );
};

// @desc    Get project statistics
// @route   GET /api/projects/:id/stats
exports.getProjectStats = (req, res) => {
  const { id } = req.params;

  console.log("📊 Fetching stats for project ID:", id);

  const query = `
    SELECT 
      COUNT(DISTINCT s.id) as total_stories,
      COUNT(DISTINCT t.id) as total_tasks,
      SUM(CASE WHEN t.status = 'Done' THEN 1 ELSE 0 END) as completed_tasks,
      SUM(CASE WHEN t.status = 'In Progress' THEN 1 ELSE 0 END) as in_progress_tasks,
      SUM(CASE WHEN t.status = 'To Do' THEN 1 ELSE 0 END) as todo_tasks,
      COUNT(DISTINCT tm.user_email) as team_members
    FROM projects p
    LEFT JOIN stories s ON p.id = s.project_id
    LEFT JOIN tasks t ON s.id = t.story_id
    LEFT JOIN team_members tm ON p.id = tm.project_id
    WHERE p.id = ?
  `;

  db.get(query, [id], (err, stats) => {
    if (err) {
      console.error("❌ Database error:", err.message);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    
    console.log("✅ Stats fetched successfully");
    res.json({ 
      success: true, 
      stats: {
        total_stories: stats?.total_stories || 0,
        total_tasks: stats?.total_tasks || 0,
        completed_tasks: stats?.completed_tasks || 0,
        in_progress_tasks: stats?.in_progress_tasks || 0,
        todo_tasks: stats?.todo_tasks || 0,
        team_members: stats?.team_members || 0
      }
    });
  });
};