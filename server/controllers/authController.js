const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (id, email) => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// @desc    Check if user needs OTP verification
// @route   POST /api/auth/check-needs-otp
exports.checkNeedsOTP = (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ 
      success: false, 
      error: "Email is required" 
    });
  }

  db.get(
    "SELECT id, email, is_verified FROM users WHERE email = ?",
    [email.toLowerCase()],
    (err, user) => {
      if (err) {
        console.error("❌ Database error:", err.message);
        return res.status(500).json({ success: false, error: err.message });
      }
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          error: "User not found. Please register first." 
        });
      }

      res.json({ 
        success: true, 
        needsOTP: user.is_verified === 0 || !user.is_verified,
        isVerified: user.is_verified === 1
      });
    }
  );
};

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  console.log("📝 Registration attempt for:", email);

  if (!name || !email || !password) {
    return res.status(400).json({ 
      success: false, 
      error: "Name, email, and password are required" 
    });
  }

  if (password.length < 6) {
    return res.status(400).json({ 
      success: false, 
      error: "Password must be at least 6 characters" 
    });
  }

  // Check if user already exists
  db.get("SELECT id FROM users WHERE email = ?", [email.toLowerCase()], async (err, existingUser) => {
    if (err) {
      console.error("❌ Database error:", err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
    
    if (existingUser) {
      return res.status(400).json({ success: false, error: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user (is_verified = 0 by default)
    db.run(
      "INSERT INTO users (name, email, password, is_verified) VALUES (?, ?, ?, 0)",
      [name, email.toLowerCase(), hashedPassword],
      function (err) {
        if (err) {
          console.error("❌ Database error:", err.message);
          return res.status(500).json({ success: false, error: err.message });
        }

        const userId = this.lastID;
        const token = generateToken(userId, email);

        console.log("✅ User registered successfully with ID:", userId);

        res.status(201).json({
          success: true,
          message: "User registered successfully. Please verify your email with OTP.",
          token,
          user: { 
            id: userId, 
            name, 
            email: email.toLowerCase(),
            isVerified: false
          },
        });
      }
    );
  });
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = (req, res) => {
  const { email, password } = req.body;

  console.log("📝 Login attempt for:", email);

  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      error: "Email and password are required" 
    });
  }

  db.get("SELECT * FROM users WHERE email = ?", [email.toLowerCase()], async (err, user) => {
    if (err) {
      console.error("❌ Database error:", err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
    
    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user.id, user.email);
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    console.log("✅ Login successful for:", email);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: userWithoutPassword,
    });
  });
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = (req, res) => {
  console.log("📝 Getting user info for ID:", req.user.id);

  db.get(
    "SELECT id, name, email, role, is_verified, created_at FROM users WHERE id = ?",
    [req.user.id],
    (err, user) => {
      if (err) {
        console.error("❌ Database error:", err.message);
        return res.status(500).json({ success: false, error: err.message });
      }
      if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
      }
      console.log("✅ User found:", user.email);
      res.json({ success: true, user });
    }
  );
};

// @desc    Google Login
// @route   POST /api/auth/google
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
    // Fetch user info from Google
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`
    );
    
    const payload = await response.json();

    if (payload.error) {
      return res.status(401).json({ 
        success: false, 
        error: "Invalid Google token" 
      });
    }

    const { email, name, picture } = payload;

    // Check if user exists
    db.get("SELECT * FROM users WHERE email = ?", [email.toLowerCase()], async (err, user) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }

      if (!user) {
        // Create new user
        const randomPassword = Math.random().toString(36).slice(-16);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        db.run(
          "INSERT INTO users (name, email, password, is_verified, avatar) VALUES (?, ?, ?, 1, ?)",
          [name || email.split('@')[0], email.toLowerCase(), hashedPassword, picture || null],
          function (err) {
            if (err) {
              return res.status(500).json({ success: false, error: err.message });
            }
            
            const userId = this.lastID;
            const jwtToken = generateToken(userId, email);
            
            res.json({
              success: true,
              message: "Google login successful",
              token: jwtToken,
              user: { 
                id: userId, 
                name: name || email.split('@')[0],
                email: email.toLowerCase(),
                isVerified: true
              }
            });
          }
        );
      } else {
        // Login existing user
        const jwtToken = generateToken(user.id, user.email);
        const { password: _, ...userWithoutPassword } = user;
        
        res.json({
          success: true,
          message: "Google login successful",
          token: jwtToken,
          user: userWithoutPassword
        });
      }
    });
  } catch (error) {
    console.error("Google verification error:", error);
    res.status(401).json({ 
      success: false, 
      error: "Invalid Google token. Please try again." 
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
exports.updateProfile = (req, res) => {
  const { name, email, bio, phone, location, github, linkedin } = req.body;
  const userId = req.user.id;

  const query = `
    UPDATE users 
    SET name = COALESCE(?, name),
        email = COALESCE(?, email),
        bio = COALESCE(?, bio),
        phone = COALESCE(?, phone),
        location = COALESCE(?, location),
        github = COALESCE(?, github),
        linkedin = COALESCE(?, linkedin),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(query, [name, email, bio, phone, location, github, linkedin, userId], function(err) {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, message: "Profile updated successfully" });
  });
};

// @desc    Change password
// @route   PUT /api/auth/change-password
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

  db.get("SELECT password FROM users WHERE id = ?", [userId], async (err, user) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    
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

    db.run("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, userId], function(err) {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      res.json({ success: true, message: "Password changed successfully" });
    });
  });
};

// @desc    Delete user account
// @route   DELETE /api/auth/account
exports.deleteAccount = (req, res) => {
  const userId = req.user.id;

  db.get("SELECT COUNT(*) as count FROM projects WHERE created_by = ?", [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }

    if (result.count > 0) {
      return res.status(400).json({ 
        success: false, 
        error: "Cannot delete account. You own projects. Transfer ownership first." 
      });
    }

    db.run("DELETE FROM users WHERE id = ?", [userId], function(err) {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      res.json({ success: true, message: "Account deleted successfully" });
    });
  });
};

// @desc    Check if user needs role setup
// @route   GET /api/auth/check-role-setup
exports.checkRoleSetup = (req, res) => {
  const userId = req.user.id;

  db.get("SELECT role FROM users WHERE id = ?", [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ 
      success: true, 
      needsRoleSetup: !user || !user.role || user.role === 'member' 
    });
  });
};