const express = require("express");
const router = express.Router();

// Controller functions
const {
  signup,
  login,
  googleAuth,
  requestOtp,
  resetPassword,  // ✅ Include resetPassword route
} = require("../controllers/authController");

// ------------------------
// Auth Routes
// ------------------------

// User signup
router.post("/signup", signup);

// User login
router.post("/login", login);

// Google Sign-In / Sign-Up
// Google Sign-In / Sign-Up (merged route)
router.post("/google-auth", googleAuth);

// Google Signup (separate route)
router.post("/google-signup", googleSignup);


// Request OTP for password reset
router.post("/request-reset", requestOtp);

// Reset password using OTP
router.post("/reset-password", resetPassword);  // ✅ Use resetPassword controller

module.exports = router;