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

// Send email when user is added to team
exports.sendTeamMemberEmail = async (toEmail, projectName, role, addedByName) => {
  console.log(`📧 Sending team invitation to: ${toEmail}`);

  const subject = `You've been added to a project - AgileFlow`;
  const text = `
Hello,

You have been added as a "${role}" to the project "${projectName}" by ${addedByName}.

You can now view and collaborate on this project in AgileFlow.

Login to your account to get started: ${process.env.CLIENT_URL || "https://agile-project-management-code-review-1.onrender.com"}

Best regards,
AgileFlow Team
  `;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Team Invitation - AgileFlow</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }
        .container { max-width: 500px; margin: 50px auto; background: white; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .project-name { font-size: 24px; font-weight: bold; color: #667eea; margin: 10px 0; }
        .role-badge { display: inline-block; background: #e0e7ff; color: #4338ca; padding: 5px 15px; border-radius: 20px; font-size: 14px; }
        .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #718096; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header"><h1>🏆 AgileFlow</h1><p>Project Management Tool</p></div>
        <div class="content">
          <h2>Hello!</h2>
          <p>You have been added to the project:</p>
          <div class="project-name">"${projectName}"</div>
          <p>Your role: <span class="role-badge">${role}</span></p>
          <p>Added by: <strong>${addedByName}</strong></p>
          <a href="${process.env.CLIENT_URL || 'https://agile-project-management-code-review-1.onrender.com'}" class="button">Go to Dashboard</a>
        </div>
        <div class="footer"><p>&copy; 2024 AgileFlow. All rights reserved.</p></div>
      </div>
    </body>
    </html>
  `;

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"AgileFlow" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: subject,
      text: text,
      html: htmlContent,
    });
    console.log(`✅ Team invitation email sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error("❌ Team email error:", error.message);
    return false;
  }
};

// Send task assignment email (updated with HTML)
exports.sendTaskEmail = async (to, subject, text, taskDetails = {}) => {
  console.log(`📧 Sending task email to: ${to}`);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Task Assignment - AgileFlow</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }
        .container { max-width: 500px; margin: 50px auto; background: white; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .task-title { font-size: 20px; font-weight: bold; color: #333; margin: 10px 0; }
        .details { background: #f8f9fa; padding: 15px; border-radius: 10px; margin: 15px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
        .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #718096; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header"><h1>🏆 AgileFlow</h1><p>Project Management Tool</p></div>
        <div class="content">
          <h2>Hello ${taskDetails.assigneeName || "Team Member"}!</h2>
          <p>You have been assigned a new task:</p>
          <div class="task-title">"${taskDetails.taskTitle || text.split('"')[1] || "New Task"}"</div>
          
          <div class="details">
            <div class="detail-row"><strong>Story:</strong> <span>${taskDetails.storyTitle || "N/A"}</span></div>
            <div class="detail-row"><strong>Project:</strong> <span>${taskDetails.projectTitle || "N/A"}</span></div>
            <div class="detail-row"><strong>Deadline:</strong> <span>${taskDetails.deadline || "Not set"}</span></div>
            <div class="detail-row"><strong>Assigned by:</strong> <span>${taskDetails.assignerName || "Project Owner"}</span></div>
          </div>
          
          <a href="${process.env.CLIENT_URL || 'https://agile-project-management-code-review-1.onrender.com'}/my-tasks" class="button">View My Tasks</a>
        </div>
        <div class="footer"><p>&copy; 2024 AgileFlow. All rights reserved.</p></div>
      </div>
    </body>
    </html>
  `;

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"AgileFlow" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      text: text,
      html: htmlContent,
    });
    console.log(`✅ Task email sent to ${to}`);
    return true;
  } catch (error) {
    console.error("❌ Task email error:", error.message);
    return false;
  }
};
// Send password reset email
exports.sendPasswordResetEmail = async (to, otpCode, userName) => {
  console.log(`📧 Sending password reset OTP to: ${to}`);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Password Reset - AgileFlow</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }
        .container { max-width: 500px; margin: 50px auto; background: white; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 40px 30px; text-align: center; }
        .otp-code { font-size: 48px; font-weight: bold; color: #667eea; letter-spacing: 8px; margin: 20px 0; padding: 15px; background: #f0f0f0; border-radius: 12px; font-family: monospace; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #718096; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header"><h1>🔐 AgileFlow</h1><p>Password Reset</p></div>
        <div class="content">
          <h2>Hello ${userName || "User"}!</h2>
          <p>You requested to reset your password. Use the following OTP:</p>
          <div class="otp-code">${otpCode}</div>
          <p>This OTP is valid for <strong>10 minutes</strong>.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
        <div class="footer"><p>&copy; 2024 AgileFlow. All rights reserved.</p></div>
      </div>
    </body>
    </html>
  `;

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"AgileFlow" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: to,
      subject: "Reset Your Password - AgileFlow",
      text: `Your OTP for password reset is: ${otpCode}. Valid for 10 minutes.`,
      html: htmlContent,
    });
    console.log(`✅ Password reset email sent to ${to}`);
    return true;
  } catch (error) {
    console.error("❌ Password reset email error:", error.message);
    return false;
  }
};