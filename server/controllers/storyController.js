const db = require("../config/db");

// @desc    Create story (Only Project Owner)
// @route   POST /api/stories
exports.createStory = (req, res) => {
  const { project_id, title, description, status } = req.body;
  const userId = req.user.id;

  console.log("📝 Creating story for project:", project_id);

  // Verify user is project owner
  db.get(
    "SELECT created_by FROM projects WHERE id = ?",
    [project_id],
    (err, project) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      if (!project) {
        return res.status(404).json({ success: false, error: "Project not found" });
      }
      
      // Check if user is project owner
      if (project.created_by !== userId) {
        return res.status(403).json({ 
          success: false, 
          error: "Only the Product Owner can create stories" 
        });
      }

      // Create story
      db.run(
        "INSERT INTO stories (project_id, title, description, status, created_by) VALUES (?, ?, ?, ?, ?)",
        [project_id, title, description || "", status || "To Do", userId],
        function (err) {
          if (err) {
            console.error("❌ Story creation error:", err.message);
            return res.status(500).json({ success: false, error: err.message });
          }

          console.log("✅ Story created with ID:", this.lastID);
          res.status(201).json({
            success: true,
            message: "Story created successfully",
            story: { 
              id: this.lastID, 
              project_id, 
              title, 
              description, 
              status 
            }
          });
        }
      );
    }
  );
};

// @desc    Get stories by project (Anyone in team can view)
// @route   GET /api/stories/project/:projectId
exports.getStoriesByProject = (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;
  const userEmail = req.user.email;

  // Check if user has access to project
  db.get(
    `SELECT id FROM projects 
     WHERE id = ? AND (created_by = ? OR id IN (
       SELECT project_id FROM team_members WHERE project_id = ? AND user_email = ?
     ))`,
    [projectId, userId, projectId, userEmail],
    (err, project) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      if (!project) {
        return res.status(403).json({ 
          success: false, 
          error: "You don't have access to this project" 
        });
      }

      db.all(
        "SELECT * FROM stories WHERE project_id = ? ORDER BY created_at DESC",
        [projectId],
        (err, rows) => {
          if (err) {
            return res.status(500).json({ success: false, error: err.message });
          }
          res.json({ success: true, stories: rows || [] });
        }
      );
    }
  );
};

// @desc    Get single story with tasks (Anyone in team can view)
// @route   GET /api/stories/:id
exports.getStoryById = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userEmail = req.user.email;

  db.get(
    `SELECT s.*, p.created_by as project_owner 
     FROM stories s 
     JOIN projects p ON s.project_id = p.id 
     WHERE s.id = ? AND (p.created_by = ? OR p.id IN (
       SELECT project_id FROM team_members WHERE project_id = p.id AND user_email = ?
     ))`,
    [id, userId, userEmail],
    (err, story) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      if (!story) {
        return res.status(404).json({ success: false, error: "Story not found" });
      }

      db.all("SELECT * FROM tasks WHERE story_id = ? ORDER BY deadline ASC", [id], (err, tasks) => {
        if (err) {
          return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, story, tasks: tasks || [] });
      });
    }
  );
};

// @desc    Update story (Only Project Owner)
// @route   PUT /api/stories/:id
exports.updateStory = (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;
  const userId = req.user.id;

  db.get(
    `SELECT s.*, p.created_by as project_owner 
     FROM stories s 
     JOIN projects p ON s.project_id = p.id 
     WHERE s.id = ?`,
    [id],
    (err, story) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      if (!story) {
        return res.status(404).json({ success: false, error: "Story not found" });
      }
      
      if (story.project_owner !== userId) {
        return res.status(403).json({ 
          success: false, 
          error: "Only the Product Owner can update stories" 
        });
      }

      db.run(
        `UPDATE stories 
         SET title = COALESCE(?, title), 
             description = COALESCE(?, description), 
             status = COALESCE(?, status),
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [title, description, status, id],
        function (err) {
          if (err) {
            return res.status(500).json({ success: false, error: err.message });
          }
          res.json({ success: true, message: "Story updated successfully" });
        }
      );
    }
  );
};

// @desc    Delete story (Only Project Owner)
// @route   DELETE /api/stories/:id
exports.deleteStory = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  db.get(
    `SELECT s.*, p.created_by as project_owner 
     FROM stories s 
     JOIN projects p ON s.project_id = p.id 
     WHERE s.id = ?`,
    [id],
    (err, story) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      if (!story) {
        return res.status(404).json({ success: false, error: "Story not found" });
      }
      
      if (story.project_owner !== userId) {
        return res.status(403).json({ 
          success: false, 
          error: "Only the Product Owner can delete stories" 
        });
      }

      db.run("DELETE FROM stories WHERE id = ?", [id], function (err) {
        if (err) {
          return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, message: "Story deleted successfully" });
      });
    }
  );
};