const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (id, email) => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: "All fields are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, error: "Password must be at least 6 characters" });
  }

  try {
    const existingUser = db.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase());
    
    if (existingUser) {
      return res.status(400).json({ success: false, error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = db.prepare(
      "INSERT INTO users (name, email, password, is_verified, role) VALUES (?, ?, ?, 1, 'member')"
    ).run(name, email.toLowerCase(), hashedPassword);

    const token = generateToken(result.lastInsertRowid, email);
    const newUser = db.prepare("SELECT id, name, email, role FROM users WHERE id = ?").get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: newUser,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Email and password required" });
  }

  try {
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase());
    
    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (!isMatch) {
        return res.status(401).json({ success: false, error: "Invalid credentials" });
      }

      const token = generateToken(user.id, user.email);
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: "Login successful",
        token,
        user: userWithoutPassword,
      });
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getMe = (req, res) => {
  try {
    const user = db.prepare("SELECT id, name, email, role FROM users WHERE id = ?").get(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.googleLogin = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, error: "Google token is required" });
  }

  try {
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`);
    const payload = await response.json();

    if (payload.error) {
      return res.status(401).json({ success: false, error: "Invalid Google token" });
    }

    const { email, name } = payload;

    let user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase());

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-16);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      const result = db.prepare(
        "INSERT INTO users (name, email, password, is_verified, role) VALUES (?, ?, ?, 1, 'member')"
      ).run(name || email.split('@')[0], email.toLowerCase(), hashedPassword);

      const userId = result.lastInsertRowid;
      const jwtToken = generateToken(userId, email);
      const newUser = db.prepare("SELECT id, name, email, role FROM users WHERE id = ?").get(userId);
      
      return res.json({
        success: true,
        message: "Google login successful",
        token: jwtToken,
        user: newUser
      });
    } else {
      const jwtToken = generateToken(user.id, user.email);
      const { password: _, ...userWithoutPassword } = user;
      
      return res.json({
        success: true,
        message: "Google login successful",
        token: jwtToken,
        user: userWithoutPassword
      });
    }
  } catch (error) {
    console.error("Google verification error:", error);
    res.status(401).json({ success: false, error: "Invalid Google token" });
  }
};

// Check role setup - FIXED for better-sqlite3
exports.checkRoleSetup = (req, res) => {
  const userId = req.user.id;
  
  console.log("Checking role setup for user:", userId);
  
  try {
    const user = db.prepare("SELECT role FROM users WHERE id = ?").get(userId);
    
    if (!user) {
      console.log("User not found:", userId);
      return res.status(404).json({ success: false, error: "User not found" });
    }
    
    const needsRoleSetup = !user.role || user.role === 'member';
    console.log(`User ${userId} - Role: ${user.role}, Needs setup: ${needsRoleSetup}`);
    
    res.json({ success: true, needsRoleSetup });
  } catch (err) {
    console.error("Database error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
// Change password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ 
      success: false, 
      error: "Current password and new password are required" 
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ 
      success: false, 
      error: "New password must be at least 6 characters" 
    });
  }

  try {
    const user = db.prepare("SELECT password FROM users WHERE id = ?").get(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        error: "Current password is incorrect" 
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashedPassword, userId);
    
    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};