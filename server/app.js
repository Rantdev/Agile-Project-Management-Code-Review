require("dotenv").config();
const express = require("express");
const cors = require("cors");
const initDB = require("./models/initDB");

const authRoutes = require("./routes/authRoutes");

const app = express();

// Initialize database
initDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
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
      team: "/api/team"
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: "Something went wrong!" });
});

module.exports = app;
