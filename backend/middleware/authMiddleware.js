const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Ensure the authorization header starts with "Bearer"
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    // Extract the token from the header
    const token = authHeader.split(" ")[1];

    // Verify the token with your JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded);
console.log("Token Expires At:", new Date(decoded.exp * 1000));

    // Find the user from the decoded token data
    const user = await User.findById(decoded.userId).select('-password'); // We don't need the password field

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Attach user information to the request object for use in subsequent routes
    req.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    };

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Token verification error:", error);

    // Handle specific JWT errors
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { protect }; 