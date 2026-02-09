// controllers/otpController.js
const sendOtpMail = require("../utils/sendOtpMail");
const User = require("../models/User");
const Otp = require("../models/Otp"); // ensure filename is Otp.js or change to match actual filename
const bcrypt = require("bcryptjs");

// NOTE: we removed the hard-coded transporter here and rely on utils/sendOtpMail
// which reads credentials from process.env (GMAIL_USER, GMAIL_APP_PASSWORD).

// Send OTP
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otpCode = String(Math.floor(100000 + Math.random() * 900000)); // string

    // Upsert OTP (use `code` field to match schema)
    await Otp.findOneAndUpdate(
      { email },
      { email, code: otpCode, expiresAt: new Date(Date.now() + 5 * 60 * 1000) },
      { upsert: true, new: true }
    );

    // Use centralized mail util that reads from env vars
    await sendOtpMail(email, otpCode);

    return res.status(200).json({ message: "OTP sent successfully!" });
  } catch (err) {
    console.error("Error sending OTP:", err);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};

// Verify OTP and reset password
const verifyOTP = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP and newPassword are required" });
    }

    const otpRecord = await Otp.findOne({ email, code: String(otp) });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date(otpRecord.expiresAt).getTime() < Date.now()) {
      await Otp.deleteOne({ email });
      return res.status(400).json({ message: "OTP expired" });
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ email }, { $set: { password: hashedPassword } });

    // Delete OTP after successful reset
    await Otp.deleteOne({ email });

    return res.status(200).json({ message: "Password reset successful!" });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    return res.status(500).json({ message: "Failed to reset password" });
  }
};

module.exports = { sendOTP, verifyOTP };
