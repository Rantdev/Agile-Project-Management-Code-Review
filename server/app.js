require("dotenv").config();
const express = require("express");
const cors = require("cors");
const initDB = require("./models/initDB");

// Import all routes
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const storyRoutes = require("./routes/storyRoutes");
const taskRoutes = require("./routes/taskRoutes");
const teamRoutes = require("./routes/teamRoutes");
const profileRoutes = require("./routes/profileRoutes");
const performanceRoutes = require("./routes/performanceRoutes");

const app = express();

// Initialize database
initDB();

// CORS - Allow all origins for deployment
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register all routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/performance", performanceRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({ 
    message: "AgileFlow API is running",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      auth: "/api/auth",
      projects: "/api/projects",
      stories: "/api/stories",
      tasks: "/api/tasks",
      team: "/api/team",
      profile: "/api/profile",
      performance: "/api/performance"
    }
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ success: false, error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.url}` });
});

module.exports = app;