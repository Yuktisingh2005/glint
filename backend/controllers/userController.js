// userController.js — Using AWS SDK v3 with regular multer-s3
require("dotenv").config();
const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");
const User = require("../models/User");

// AWS S3 Client Setup
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Multer-S3 Upload Middleware
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: "public-read",
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const fileName = `profile-pics/${Date.now()}_${file.originalname}`;
      cb(null, fileName);
    },
  }),
});

// Middleware to handle single file upload named 'profilePic'
const uploadMiddleware = upload.single("profilePic");

// Upload handler
const uploadProfilePic = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const fileUrl = file.location;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePic: fileUrl },
      { new: true }
    );

    res.json({ profilePic: user.profilePic });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET User by ID
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ PUT Update User by ID
const updateUser = async (req, res) => {
  try {
    const { name, email, birthDate } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, birthDate },
      { new: true }
    );

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET current logged-in user (/api/auth/me)
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ EXPORT everything properly
module.exports = {
  getUser,
  updateUser,
  uploadProfilePic,
  uploadMiddleware,
  getMe,
};
