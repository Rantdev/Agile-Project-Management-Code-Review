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

  console.log("📝 Register attempt:", email);

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
      "INSERT INTO users (name, email, password, is_verified, role) VALUES (?, ?, ?, 1, 'member')"
    ).run(name, email.toLowerCase(), hashedPassword);

    const token = generateToken(result.lastInsertRowid, email);
    
    // Get the created user
    const newUser = db.prepare("SELECT id, name, email, role FROM users WHERE id = ?").get(result.lastInsertRowid);

    console.log("✅ User registered successfully:", newUser);

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

// Login user
exports.login = (req, res) => {
  const { email, password } = req.body;

  console.log("📝 Login attempt:", email);

  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      error: "Email and password required" 
    });
  }

  try {
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase());
    
    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (!isMatch) {
        console.log("❌ Invalid password for:", email);
        return res.status(401).json({ success: false, error: "Invalid credentials" });
      }

      const token = generateToken(user.id, user.email);
      const { password: _, ...userWithoutPassword } = user;
      
      console.log("✅ Login successful for:", email);

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
  console.log("📝 Get current user, ID:", req.user.id);
  
  try {
    const user = db.prepare("SELECT id, name, email, role FROM users WHERE id = ?").get(req.user.id);
    
    if (!user) {
      console.log("❌ User not found in database:", req.user.id);
      return res.status(404).json({ success: false, error: "User not found" });
    }
    
    console.log("✅ User found:", user);
    res.json({ success: true, user });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Google Login
exports.googleLogin = async (req, res) => {
  const { token } = req.body;

  console.log("📝 Google login attempt");

  if (!token) {
    return res.status(400).json({ 
      success: false, 
      error: "Google token is required" 
    });
  }

  try {
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`);
    const payload = await response.json();

    if (payload.error) {
      console.error("Google token error:", payload.error);
      return res.status(401).json({ 
        success: false, 
        error: "Invalid Google token" 
      });
    }

    const { email, name } = payload;
    console.log("✅ Google user verified:", { email, name });

    // Check if user exists
    let user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase());

    if (!user) {
      // Create new user
      console.log("📝 Creating new user from Google login:", email);
      
      const randomPassword = Math.random().toString(36).slice(-16);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      const result = db.prepare(
        "INSERT INTO users (name, email, password, is_verified, role) VALUES (?, ?, ?, 1, 'member')"
      ).run(name || email.split('@')[0], email.toLowerCase(), hashedPassword);

      const userId = result.lastInsertRowid;
      const jwtToken = generateToken(userId, email);
      
      // Get the created user
      const newUser = db.prepare("SELECT id, name, email, role FROM users WHERE id = ?").get(userId);
      
      console.log("✅ New Google user created:", newUser);
      
      return res.json({
        success: true,
        message: "Google login successful",
        token: jwtToken,
        user: newUser
      });
    } else {
      // Login existing user
      console.log("✅ Existing Google user logged in:", user.id);
      
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
    console.error("❌ Google verification error:", error);
    res.status(401).json({ 
      success: false, 
      error: "Invalid Google token. Please try again." 
    });
  }
};

// Check role setup
exports.checkRoleSetup = (req, res) => {
  console.log("📝 Check role setup for user:", req.user.id);
  
  try {
    const user = db.prepare("SELECT role FROM users WHERE id = ?").get(req.user.id);
    const needsRoleSetup = !user || !user.role || user.role === 'member';
    console.log(`User ${req.user.id} - Role: ${user?.role}, Needs setup: ${needsRoleSetup}`);
    res.json({ success: true, needsRoleSetup });
  } catch (error) {
    console.error("Role check error:", error);
    res.json({ success: true, needsRoleSetup: true });
  }
};

// Check if user needs OTP
exports.checkNeedsOTP = (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, error: "Email is required" });
  }

  try {
    const user = db.prepare("SELECT id, email FROM users WHERE email = ?").get(email.toLowerCase());
    
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Always return false (no OTP required)
    res.json({ success: true, needsOTP: false, isVerified: true });
  } catch (error) {
    console.error("Check needs OTP error:", error);
    res.json({ success: true, needsOTP: false });
  }
};