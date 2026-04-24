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

// Send OTP email to user's email address
exports.sendOTPEmail = async (userEmail, otpCode, userName) => {
  // Development mode: Log OTP to console
  if (process.env.NODE_ENV === 'development') {
    console.log(`\n========== 🔐 DEVELOPMENT MODE ==========`);
    console.log(`📧 To: ${userEmail}`);
    console.log(`👤 User: ${userName || "User"}`);
    console.log(`🔑 OTP Code: ${otpCode}`);
    console.log(`⏰ Expires in: 10 minutes`);
    console.log(`=========================================\n`);
  }

  try {
    const transporter = getTransporter();
    
    console.log(`📧 Attempting to send OTP to user email: ${userEmail}`);
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>OTP Verification - AgileFlow</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f7f6;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 500px;
            margin: 50px auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .header p {
            margin: 10px 0 0;
            opacity: 0.9;
          }
          .content {
            padding: 40px 30px;
            text-align: center;
          }
          .otp-code {
            font-size: 48px;
            font-weight: bold;
            color: #667eea;
            letter-spacing: 8px;
            margin: 20px 0;
            padding: 15px;
            background: #f0f0f0;
            border-radius: 12px;
            font-family: monospace;
          }
          .message {
            color: #4a5568;
            line-height: 1.6;
            margin: 20px 0;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #718096;
            font-size: 12px;
          }
          .warning {
            color: #e53e3e;
            font-size: 12px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 AgileFlow</h1>
            <p>Project Management Tool</p>
          </div>
          <div class="content">
            <h2>Hello ${userName || "User"}!</h2>
            <p class="message">Thank you for using AgileFlow. Use the following OTP to verify your email address:</p>
            <div class="otp-code">${otpCode}</div>
            <p class="message">This OTP is valid for <strong>10 minutes</strong>.</p>
            <p class="message">If you didn't request this, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 AgileFlow. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send to the user's email address
    const mailOptions = {
      from: `"AgileFlow" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "🔐 Verify Your Email - AgileFlow OTP",
      text: `Your OTP for email verification is: ${otpCode}. Valid for 10 minutes.`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully to: ${userEmail}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("❌ OTP email error:", error.message);
    if (error.response) {
      console.error("SMTP Response:", error.response);
    }
    
    // In development mode, don't fail if email doesn't send
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚠️ Development Mode: Email sending failed, but OTP is available in console log above.`);
      return true; // Return true so OTP flow continues
    }
    
    return false;
  }
};

// Send task assignment email
exports.sendTaskEmail = async (to, subject, text) => {
  try {
    const transporter = getTransporter();
    
    console.log(`📧 Sending task email to: ${to}`);
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h2 style="color: white; margin: 0;">AgileFlow</h2>
        </div>
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #333;">${text}</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #dee2e6;">
          <p style="font-size: 12px; color: #666; text-align: center;">This is an automated message from AgileFlow</p>
        </div>
      </div>
    `;
    
    await transporter.sendMail({
      from: `"AgileFlow" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      text: text,
      html: htmlContent,
    });
    
    console.log(`✅ Task email sent to: ${to}`);
    return true;
  } catch (error) {
    console.error("❌ Task email error:", error.message);
    
    // In development mode, log instead of failing
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚠️ Development Mode: Task email would be sent to: ${to}`);
      console.log(`📧 Subject: ${subject}`);
      console.log(`📝 Message: ${text}`);
      return true;
    }
    
    return false;
  }
};

// Test email configuration
exports.testEmailConfig = async (req, res) => {
  try {
    const transporter = getTransporter();
    
    // Verify connection
    await transporter.verify();
    
    console.log("✅ Email transporter is ready");
    
    res.json({
      success: true,
      message: "Email configuration is working",
      emailUser: process.env.EMAIL_USER,
      emailFrom: process.env.EMAIL_FROM || process.env.EMAIL_USER
    });
  } catch (error) {
    console.error("❌ Email configuration error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};