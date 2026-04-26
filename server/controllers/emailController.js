const nodemailer = require("nodemailer");

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    console.log("📧 Creating email transporter...");
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
};

// Send OTP email
exports.sendOTPEmail = async (to, otpCode, userName) => {
  console.log(`📧 Sending OTP to: ${to}`);

  // For development, log OTP to console
  if (process.env.NODE_ENV === 'development') {
    console.log(`\n========== 🔐 DEVELOPMENT MODE ==========`);
    console.log(`📧 To: ${to}`);
    console.log(`👤 User: ${userName || "User"}`);
    console.log(`🔑 OTP Code: ${otpCode}`);
    console.log(`⏰ Expires in: 10 minutes`);
    console.log(`=========================================\n`);
    return true;
  }

  try {
    const transporter = getTransporter();
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>OTP Verification - AgileFlow</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }
          .container { max-width: 500px; margin: 50px auto; background: white; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); overflow: hidden; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 40px 30px; text-align: center; }
          .otp-code { font-size: 48px; font-weight: bold; color: #667eea; letter-spacing: 8px; margin: 20px 0; padding: 15px; background: #f0f0f0; border-radius: 12px; font-family: monospace; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #718096; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>🔐 AgileFlow</h1><p>Project Management Tool</p></div>
          <div class="content">
            <h2>Hello ${userName || "User"}!</h2>
            <p>Your OTP for verification is:</p>
            <div class="otp-code">${otpCode}</div>
            <p>This OTP is valid for <strong>10 minutes</strong>.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
          <div class="footer"><p>&copy; 2024 AgileFlow. All rights reserved.</p></div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"AgileFlow" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: to,
      subject: "🔐 Verify Your Email - AgileFlow OTP",
      text: `Your OTP for email verification is: ${otpCode}. Valid for 10 minutes.`,
      html: htmlContent,
    });
    
    console.log(`✅ OTP email sent to ${to}`);
    return true;
  } catch (error) {
    console.error("❌ OTP email error:", error.message);
    return false;
  }
};

// Send task email
exports.sendTaskEmail = async (to, subject, text) => {
  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"AgileFlow" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      text: text,
    });
    console.log(`✅ Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error("❌ Email error:", error.message);
    return false;
  }
};