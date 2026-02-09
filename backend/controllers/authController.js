const User = require("../models/User");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Look for the user by email
    const user = await User.findOne({ email }).select("+password");

    // Block login if email is not registered
    if (!user) {
      return res.status(404).json({ message: "Email is not registered. Please sign up first." });
    }

    // Block login if this is a Google account
    if (user.isGoogleUser && !user.password) {
      return res.status(400).json({ message: "This account was created with Google. Please log in with Google." });
    }

    // Ensure the user has a password set
    if (!user.password) {
      return res.status(400).json({ message: "No password set for this account. Please reset your password or use Google login." });
    }

    // Compare provided password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);
    res.json({
      message: "Logged in successfully",
      token,
      userId: user._id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const Otp = require("../models/Otp");
const verifyToken = require("../config/googleAuth");
const sendOtpMail = require("../utils/sendOtpMail");

// Temporary in-memory OTP store (for demo purposes)
const otpStore = new Map();

// ------------------------
// Signup
// ------------------------
const signup = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered. Please log in." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      isGoogleUser: false,
    });

    const token = generateToken(newUser._id);
    res.status(201).json({
      message: "User registered successfully",
      token,
      userId: newUser._id,
    });
  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).json({ message: err.message });
  }
};


// ------------------------
// Google Auth (Login only - no auto signup)
// ------------------------
const googleAuth = async (req, res) => {
  const { idToken } = req.body;

  try {
    const googleUser = await verifyToken(idToken);

    if (!googleUser.email_verified) {
      return res.status(400).json({ message: "Email not verified by Google" });
    }

    let user = await User.findOne({ email: googleUser.email });

    if (!user) {
      // Block Google login if email is not registered
      return res.status(404).json({
        message: "Email is not registered. Please sign up first."
      });
    }

    // If user exists but was manual signup, link Google
    if (!user.isGoogleUser && !user.googleId) {
      user.googleId = googleUser.sub;
      user.isGoogleUser = true;
      await user.save();
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: "Google authentication successful",
      token,
      user: { id: user._id, username: user.username },
    });
  } catch (err) {
    console.error("Error during Google Auth:", err);
    res.status(500).json({ error: "Google authentication failed", message: err.message });
  }
};


// ------------------------
// Forgot Password - Send OTP
// ------------------------
// Temporary in-memory OTP request tracker
const otpRequestTracker = new Map(); // email -> timestamp of last request

const requestOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "No user found with that email" });

    // Rate limiting: allow only one OTP request per 1 minute
    const lastRequest = otpRequestTracker.get(email);
    const now = Date.now();
    if (lastRequest && now - lastRequest < 60 * 1000) { // 60 seconds
      return res.status(429).json({ message: "Please wait 1 minute before requesting another OTP." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const expiresAt = new Date(now + 5 * 60 * 1000); // 5 minutes

    // Upsert OTP in database
    await Otp.findOneAndUpdate(
      { email },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    // Send OTP email
    await sendOtpMail(email, otp);

    // Update last request timestamp
    otpRequestTracker.set(email, now);

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("Error during OTP request:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ------------------------
// Reset Password - Using OTP
// ------------------------
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: "Email, OTP, and new password are required" });
  }

  try {
    const otpEntry = await Otp.findOne({ email });

    if (!otpEntry) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    if (otpEntry.otp !== otp) {
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    if (otpEntry.expiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Make sure user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "No user found with that email" });

    // Hash new password and update
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Delete OTP after successful password reset
    await Otp.deleteOne({ email });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Error during password reset:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};



// ------------------------
// Google Signup (Separate from login)
// ------------------------
const googleSignup = async (req, res) => {
  const { idToken } = req.body;

  try {
    const googleUser = await verifyToken(idToken);

    if (!googleUser.email_verified) {
      return res.status(400).json({ message: "Email not verified by Google" });
    }

    const existingUser = await User.findOne({ email: googleUser.email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered. Please log in." });
    }

    // Create new user with Google signup
    const newUser = await User.create({
      username: googleUser.name || googleUser.email.split('@')[0],
      email: googleUser.email,
      googleId: googleUser.sub,
      isGoogleUser: true,
      // No password for Google users
    });

    const token = generateToken(newUser._id);

    res.status(201).json({
      message: "Google signup successful",
      token,
      user: { id: newUser._id, username: newUser.username },
    });
  } catch (err) {
    console.error("Error during Google Signup:", err);
    res.status(500).json({ error: "Google signup failed", message: err.message });
  }
};

module.exports = {
  signup,
  login,
  googleAuth,
  googleSignup,
  requestOtp,
  resetPassword,
};
