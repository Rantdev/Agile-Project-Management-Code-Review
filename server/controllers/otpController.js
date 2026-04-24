const db = require("../config/db");
const { sendOTPEmail } = require("./emailController");

// Generate random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Send OTP to user's email
// @route   POST /api/otp/send
exports.sendOTP = async (req, res) => {
  const { email } = req.body;

  console.log(`📧 ===== OTP REQUEST =====`);
  console.log(`📧 Requested email: ${email}`);

  if (!email) {
    return res.status(400).json({ 
      success: false, 
      error: "Email is required" 
    });
  }

  // Check if user exists
  db.get(
    "SELECT id, email, name, is_verified FROM users WHERE email = ?", 
    [email.toLowerCase()], 
    async (err, user) => {
      if (err) {
        console.error("❌ Database error:", err.message);
        return res.status(500).json({ success: false, error: err.message });
      }

      if (!user) {
        console.log(`❌ User not found: ${email}`);
        return res.status(404).json({ 
          success: false, 
          error: "User not found. Please register first." 
        });
      }

      console.log(`✅ User found: ${user.email} (Name: ${user.name})`);
      console.log(`✅ User verified status: ${user.is_verified === 1 ? 'Verified' : 'Not Verified'}`);

      // Check if user is already verified
      if (user.is_verified === 1) {
        console.log(`✅ User already verified: ${email}`);
        return res.json({ 
          success: true, 
          alreadyVerified: true,
          message: "User already verified. You can login directly.",
          needsOTP: false
        });
      }

      // Delete old OTPs for this email (only unused ones)
      db.run("DELETE FROM otp_codes WHERE email = ? AND is_used = 0", [email.toLowerCase()], (err) => {
        if (err) {
          console.error("❌ Error deleting old OTPs:", err.message);
        }
      });

      // Generate new OTP
      const otpCode = generateOTP();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

      console.log(`📝 Generated OTP: ${otpCode}`);
      console.log(`📧 Will send OTP to user email: ${user.email}`);
      console.log(`⏰ OTP expires at: ${expiresAt.toISOString()}`);

      // Save OTP to database
      db.run(
        "INSERT INTO otp_codes (email, otp_code, expires_at) VALUES (?, ?, ?)",
        [user.email, otpCode, expiresAt.toISOString()],
        async function(err) {
          if (err) {
            console.error("❌ Database error:", err.message);
            return res.status(500).json({ success: false, error: err.message });
          }

          console.log(`✅ OTP saved to database with ID: ${this.lastID}`);
          console.log(`✅ OTP saved for email: ${user.email}`);

          // Send OTP to the user's email address
          const emailSent = await sendOTPEmail(user.email, otpCode, user.name);
          
          if (emailSent) {
            console.log(`✅ SUCCESS: OTP sent to ${user.email}`);
            res.json({ 
              success: true, 
              message: `OTP sent to ${user.email}. Please check your inbox.`,
              expiresIn: 10,
              needsOTP: true
            });
          } else {
            console.error(`❌ FAILED: Could not send OTP to ${user.email}`);
            res.status(500).json({ 
              success: false, 
              error: "Failed to send OTP email. Please check your email address and try again." 
            });
          }
        }
      );
    }
  );
};

// @desc    Verify OTP and mark user as verified
// @route   POST /api/otp/verify
exports.verifyOTP = (req, res) => {
  const { email, otpCode } = req.body;

  console.log(`🔐 ===== OTP VERIFICATION =====`);
  console.log(`🔐 Verifying OTP for email: ${email}`);
  console.log(`🔐 Entered OTP: ${otpCode}`);

  if (!email || !otpCode) {
    return res.status(400).json({ 
      success: false, 
      error: "Email and OTP code are required" 
    });
  }

  const now = new Date().toISOString();

  // Check OTP in database
  db.get(
    `SELECT * FROM otp_codes 
     WHERE email = ? 
     AND otp_code = ? 
     AND is_used = 0 
     AND expires_at > ?`,
    [email.toLowerCase(), otpCode, now],
    (err, otpRecord) => {
      if (err) {
        console.error("❌ Database error:", err.message);
        return res.status(500).json({ success: false, error: err.message });
      }

      if (!otpRecord) {
        console.log(`❌ Invalid or expired OTP for: ${email}`);
        
        // Check if OTP exists but expired
        db.get(
          `SELECT * FROM otp_codes 
           WHERE email = ? AND otp_code = ? AND is_used = 0`,
          [email.toLowerCase(), otpCode],
          (err, expiredOtp) => {
            if (expiredOtp) {
              return res.status(400).json({ 
                success: false, 
                error: "OTP has expired. Please request a new one." 
              });
            }
            return res.status(400).json({ 
              success: false, 
              error: "Invalid OTP. Please try again." 
            });
          }
        );
        return;
      }

      console.log(`✅ OTP found and valid for: ${email}`);
      console.log(`✅ OTP ID: ${otpRecord.id}, Expires at: ${otpRecord.expires_at}`);

      // Mark OTP as used
      db.run("UPDATE otp_codes SET is_used = 1 WHERE id = ?", [otpRecord.id], (err) => {
        if (err) {
          console.error("❌ Database error:", err.message);
          return res.status(500).json({ success: false, error: err.message });
        }

        console.log(`✅ OTP marked as used for: ${email}`);

        // Mark user as verified
        db.run(
          "UPDATE users SET is_verified = 1, updated_at = CURRENT_TIMESTAMP WHERE email = ?", 
          [email.toLowerCase()], 
          (err) => {
            if (err) {
              console.error("❌ Database error:", err.message);
              return res.status(500).json({ success: false, error: err.message });
            }

            console.log(`✅ User marked as verified: ${email}`);
            
            // Get updated user info
            db.get(
              "SELECT id, name, email, is_verified FROM users WHERE email = ?",
              [email.toLowerCase()],
              (err, user) => {
                if (err) {
                  console.error("❌ Database error:", err.message);
                }
                console.log(`✅ Verification complete for: ${email}`);
                
                res.json({ 
                  success: true, 
                  message: "Email verified successfully. You can now login.",
                  isVerified: true,
                  user: user || null
                });
              }
            );
          }
        );
      });
    }
  );
};

// @desc    Resend OTP to user's email
// @route   POST /api/otp/resend
exports.resendOTP = async (req, res) => {
  const { email } = req.body;

  console.log(`🔄 ===== RESEND OTP REQUEST =====`);
  console.log(`🔄 Resend requested for email: ${email}`);

  if (!email) {
    return res.status(400).json({ 
      success: false, 
      error: "Email is required" 
    });
  }

  // Check rate limiting (optional: check last request time)
  db.get(
    "SELECT COUNT(*) as recent_count FROM otp_codes WHERE email = ? AND created_at > datetime('now', '-1 minute')",
    [email.toLowerCase()],
    (err, recent) => {
      if (recent && recent.recent_count > 0) {
        console.log(`⚠️ Rate limit: Too many requests for ${email}`);
        return res.status(429).json({
          success: false,
          error: "Please wait 1 minute before requesting another OTP"
        });
      }

      // Get user details
      db.get(
        "SELECT id, email, name, is_verified FROM users WHERE email = ?", 
        [email.toLowerCase()], 
        async (err, user) => {
          if (err) {
            console.error("❌ Database error:", err.message);
            return res.status(500).json({ success: false, error: err.message });
          }

          if (!user) {
            console.log(`❌ User not found for resend: ${email}`);
            return res.status(404).json({ 
              success: false, 
              error: "User not found" 
            });
          }

          if (user.is_verified === 1) {
            console.log(`✅ User already verified: ${email}`);
            return res.json({ 
              success: true, 
              alreadyVerified: true,
              message: "User already verified. You can login directly." 
            });
          }

          // Delete old unused OTPs
          db.run("DELETE FROM otp_codes WHERE email = ? AND is_used = 0", [email.toLowerCase()]);

          // Generate new OTP
          const otpCode = generateOTP();
          const expiresAt = new Date();
          expiresAt.setMinutes(expiresAt.getMinutes() + 10);

          console.log(`📝 Generated new OTP: ${otpCode}`);
          console.log(`📧 Will resend OTP to: ${user.email}`);

          // Save new OTP to database
          db.run(
            "INSERT INTO otp_codes (email, otp_code, expires_at) VALUES (?, ?, ?)",
            [user.email, otpCode, expiresAt.toISOString()],
            async function(err) {
              if (err) {
                console.error("❌ Database error:", err.message);
                return res.status(500).json({ success: false, error: err.message });
              }

              console.log(`✅ New OTP saved with ID: ${this.lastID}`);

              // Send OTP email
              const emailSent = await sendOTPEmail(user.email, otpCode, user.name);
              
              if (emailSent) {
                console.log(`✅ OTP resent successfully to: ${user.email}`);
                res.json({ 
                  success: true, 
                  message: `OTP resent to ${user.email}. Please check your inbox.`,
                  expiresIn: 10
                });
              } else {
                console.error(`❌ Failed to resend OTP to: ${user.email}`);
                res.status(500).json({ 
                  success: false, 
                  error: "Failed to resend OTP. Please try again." 
                });
              }
            }
          );
        }
      );
    }
  );
};

// @desc    Check OTP status (for debugging)
// @route   GET /api/otp/status/:email
exports.checkOTPStatus = (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({ 
      success: false, 
      error: "Email is required" 
    });
  }

  db.get(
    `SELECT id, email, otp_code, expires_at, is_used, created_at 
     FROM otp_codes 
     WHERE email = ? 
     ORDER BY created_at DESC 
     LIMIT 1`,
    [email.toLowerCase()],
    (err, otpRecord) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }

      if (!otpRecord) {
        return res.json({ 
          success: true, 
          hasOTP: false,
          message: "No OTP found for this email" 
        });
      }

      const now = new Date();
      const expiresAt = new Date(otpRecord.expires_at);
      const isValid = !otpRecord.is_used && expiresAt > now;

      res.json({
        success: true,
        hasOTP: true,
        isUsed: otpRecord.is_used === 1,
        isValid: isValid,
        expiresAt: otpRecord.expires_at,
        createdAt: otpRecord.created_at
      });
    }
  );
};

// @desc    Clean up expired OTPs (can be called by cron job)
// @route   POST /api/otp/cleanup
exports.cleanupExpiredOTPs = (req, res) => {
  console.log(`🧹 Cleaning up expired OTPs...`);

  db.run(
    "DELETE FROM otp_codes WHERE expires_at < datetime('now') OR is_used = 1",
    function(err) {
      if (err) {
        console.error("❌ Cleanup error:", err.message);
        return res.status(500).json({ success: false, error: err.message });
      }

      console.log(`✅ Cleaned up ${this.changes || 0} expired/used OTPs`);
      res.json({ 
        success: true, 
        deletedCount: this.changes || 0,
        message: "Expired OTPs cleaned up successfully"
      });
    }
  );
};