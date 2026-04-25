const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (id, email) => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Register user
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ 
      success: false, 
      error: "All fields are required" 
    });
  }

  if (password.length < 6) {
    return res.status(400).json({ 
      success: false, 
      error: "Password must be at least 6 characters" 
    });
  }

  try {
    const existingUser = db.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase());
    
    if (existingUser) {
      return res.status(400).json({ success: false, error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = db.prepare(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)"
    ).run(name, email.toLowerCase(), hashedPassword);

    const token = generateToken(result.lastInsertRowid, email);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: { 
        id: result.lastInsertRowid, 
        name, 
        email: email.toLowerCase() 
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Login user
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      error: "Email and password required" 
    });
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

// Get current user
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

// Google Login
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
        "INSERT INTO users (name, email, password, is_verified) VALUES (?, ?, ?, 1)"
      ).run(name || email.split('@')[0], email.toLowerCase(), hashedPassword);

      const jwtToken = generateToken(result.lastInsertRowid, email);
      
      return res.json({
        success: true,
        message: "Google login successful",
        token: jwtToken,
        user: { id: result.lastInsertRowid, name: name || email.split('@')[0], email: email.toLowerCase() }
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
    console.error("Google login error:", error);
    res.status(401).json({ success: false, error: "Invalid Google token" });
  }
};

// Check role setup
exports.checkRoleSetup = (req, res) => {
  try {
    const user = db.prepare("SELECT role FROM users WHERE id = ?").get(req.user.id);
    const needsRoleSetup = !user || !user.role || user.role === 'member';
    res.json({ success: true, needsRoleSetup });
  } catch (error) {
    res.json({ success: true, needsRoleSetup: true });
  }
};