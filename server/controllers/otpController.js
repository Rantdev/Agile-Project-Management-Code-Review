const db = require("../config/db");

// Generate random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP
exports.sendOTP = (req, res) => {
  const { email } = req.body;

  console.log(`Sending OTP to: ${email}`);

  if (!email) {
    return res.status(400).json({ success: false, error: "Email is required" });
  }

  try {
    // Check if user exists
    const user = db.prepare("SELECT id, email, name FROM users WHERE email = ?").get(email.toLowerCase());
    
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Delete old OTPs
    db.prepare("DELETE FROM otp_codes WHERE email = ? AND is_used = 0").run(email.toLowerCase());

    // Generate new OTP
    const otpCode = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Save OTP to database
    db.prepare(
      "INSERT INTO otp_codes (email, otp_code, expires_at) VALUES (?, ?, ?)"
    ).run(email.toLowerCase(), otpCode, expiresAt.toISOString());

    console.log(`OTP for ${email}: ${otpCode}`);

    res.json({
      success: true,
      message: "OTP sent successfully",
      otpCode: process.env.NODE_ENV === "development" ? otpCode : undefined,
      expiresIn: 10
    });
  } catch (err) {
    console.error("Send OTP error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Verify OTP
exports.verifyOTP = (req, res) => {
  const { email, otpCode } = req.body;

  console.log(`Verifying OTP for: ${email}`);

  if (!email || !otpCode) {
    return res.status(400).json({ success: false, error: "Email and OTP are required" });
  }

  try {
    const now = new Date().toISOString();

    const otpRecord = db.prepare(`
      SELECT * FROM otp_codes 
      WHERE email = ? AND otp_code = ? AND is_used = 0 AND expires_at > ?
    `).get(email.toLowerCase(), otpCode, now);

    if (!otpRecord) {
      return res.status(400).json({ success: false, error: "Invalid or expired OTP" });
    }

    // Mark OTP as used
    db.prepare("UPDATE otp_codes SET is_used = 1 WHERE id = ?").run(otpRecord.id);

    // Mark user as verified
    db.prepare("UPDATE users SET is_verified = 1 WHERE email = ?").run(email.toLowerCase());

    res.json({
      success: true,
      message: "OTP verified successfully"
    });
  } catch (err) {
    console.error("Verify OTP error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Resend OTP
exports.resendOTP = (req, res) => {
  const { email } = req.body;

  console.log(`Resending OTP to: ${email}`);

  if (!email) {
    return res.status(400).json({ success: false, error: "Email is required" });
  }

  try {
    const user = db.prepare("SELECT id, email, name FROM users WHERE email = ?").get(email.toLowerCase());
    
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Delete old unused OTPs
    db.prepare("DELETE FROM otp_codes WHERE email = ? AND is_used = 0").run(email.toLowerCase());

    // Generate new OTP
    const otpCode = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    db.prepare(
      "INSERT INTO otp_codes (email, otp_code, expires_at) VALUES (?, ?, ?)"
    ).run(email.toLowerCase(), otpCode, expiresAt.toISOString());

    console.log(`New OTP for ${email}: ${otpCode}`);

    res.json({
      success: true,
      message: "OTP resent successfully",
      otpCode: process.env.NODE_ENV === "development" ? otpCode : undefined,
      expiresIn: 10
    });
  } catch (err) {
    console.error("Resend OTP error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};