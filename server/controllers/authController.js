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
      "INSERT INTO users (name, email, password, is_verified, role) VALUES (?, ?, ?, 1, 'member')"
    ).run(name, email.toLowerCase(), hashedPassword);

    const token = generateToken(result.lastInsertRowid, email);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: { 
        id: result.lastInsertRowid, 
        name, 
        email: email.toLowerCase(),
        role: 'member',
        isVerified: true
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

// Google Login - UPDATED with better error handling
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
    // Verify Google token
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`);
    const payload = await response.json();

    if (payload.error) {
      console.error("Google token error:", payload.error);
      return res.status(401).json({ 
        success: false, 
        error: "Invalid Google token" 
      });
    }

    const { email, name, picture } = payload;
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
      
      console.log("✅ New Google user created with ID:", userId);
      
      // Get the created user
      const newUser = db.prepare("SELECT id, name, email, role FROM users WHERE id = ?").get(userId);
      
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
  try {
    const user = db.prepare("SELECT role FROM users WHERE id = ?").get(req.user.id);
    // User needs role setup if role is null, 'member', or undefined
    const needsRoleSetup = !user || !user.role || user.role === 'member';
    console.log(`User ${req.user.id} - Role: ${user?.role}, Needs setup: ${needsRoleSetup}`);
    res.json({ success: true, needsRoleSetup });
  } catch (error) {
    console.error("Role check error:", error);
    res.json({ success: true, needsRoleSetup: true });
  }
};

// Check if user needs OTP (simplified - always return false)
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

    // For now, always return needsOTP false (no OTP required)
    res.json({ success: true, needsOTP: false, isVerified: true });
  } catch (error) {
    console.error("Check needs OTP error:", error);
    res.json({ success: true, needsOTP: false });
  }
};