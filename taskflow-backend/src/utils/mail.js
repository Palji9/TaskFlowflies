import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: process.env.MAILTRAP_SMTP_PORT,
    auth: {
      user: process.env.MAILTRAP_SMTP_USER,
      pass: process.env.MAILTRAP_SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: "noreply@taskflow.app",
      to: options.email,
      subject: options.subject,
      html: options.mailgenContent,
    });
  } catch (error) {
    console.error("Email service failed silently:", error);
  }
};

export const emailVerificationMailgenContent = (username, verificationUrl) => `
  <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;">
    <h2 style="color:#3b82f6;">Welcome to TaskFlow, ${username}!</h2>
    <p>Please verify your email by clicking the button below.</p>
    <a href="${verificationUrl}" style="display:inline-block;padding:10px 24px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0;">Verify Email</a>
    <p style="color:#6b7280;font-size:13px;">Or copy this link: ${verificationUrl}</p>
  </div>
`;

export const forgotPasswordMailgenContent = (username, passwordResetUrl) => `
  <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;">
    <h2 style="color:#3b82f6;">Password Reset — TaskFlow</h2>
    <p>Hi ${username}, we received a request to reset your password.</p>
    <a href="${passwordResetUrl}" style="display:inline-block;padding:10px 24px;background:#ef4444;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0;">Reset Password</a>
    <p style="color:#6b7280;font-size:13px;">This link expires in 20 minutes. If you didn't request this, ignore this email.</p>
  </div>
`;

export { sendEmail };
