// utils/sendOtpMail.js (optional improved error logging)
require('dotenv').config();
const nodemailer = require('nodemailer');

if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
  console.warn("Warning: GMAIL_USER or GMAIL_APP_PASSWORD not set in environment variables.");
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const sendOtpMail = async (to, otp) => {
  const mailOptions = {
    from: `"Glint Team" <${process.env.GMAIL_USER}>`,
    to,
    subject: "🔐 Glint Password Reset OTP",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>🔐 Glint Password Reset</h2>
        <p>Hello,</p>
        <p>Your OTP is: <strong style="font-size: 1.2em;">${otp}</strong></p>
        <p>This code will expire in <strong>5 minutes</strong>.</p>
        <p>If you didn’t request this, please ignore this email.</p>
        <br/>
        <p style="font-size: 0.9em;">– The Glint Team</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ OTP email sent:", info.response);
  } catch (err) {
    console.error("❌ Error sending OTP email:", err);
    throw new Error("Failed to send OTP email");
  }
};

module.exports = sendOtpMail;
