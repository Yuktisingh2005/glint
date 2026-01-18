const express = require("express");
const router = express.Router();

// Controller functions
const {
  signup,
  login,
  googleAuth,
  googleSignup,
  requestOtp,
  resetPassword,
} = require("../controllers/authController");

// ------------------------
// Auth Routes
// ------------------------

// User signup
router.post("/signup", signup);

// User login
router.post("/login", login);

// Google Sign-In (login only)
router.post("/google-auth", googleAuth);

// Google Signup (separate route)
router.post("/google-signup", googleSignup);

// Request OTP for password reset
router.post("/request-reset", requestOtp);

// Reset password using OTP
router.post("/reset-password", resetPassword);

module.exports = router;
