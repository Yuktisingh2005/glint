require("dotenv").config();
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { protect } = require("../middleware/authMiddleware");

// ✅ AWS SDK v3 S3Client + DeleteObjectCommand
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// ✅ Multer-S3 (upload logic stays the same)
const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: "public-read",
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, `profile-pics/${Date.now().toString()}-${file.originalname}`);
    },
  }),
});

// 🟡 GET user details
router.get("/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// 🟡 PUT update user profile
router.put("/:id", protect, async (req, res) => {
  try {
    const { username, email, birthDate } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, birthDate },
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

// 🟡 POST profile pic upload
router.post("/upload-pic", protect, upload.single("profilePic"), async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    // ✅ Delete old profile pic from S3 if it exists
    if (user?.profilePicKey) {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: user.profilePicKey,
        })
      );
    }

    // ✅ Save new profile pic and key
    const newUrl = req.file.location;
    const newKey = req.file.key;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: newUrl, profilePicKey: newKey },
      { new: true }
    ).select("-password");

    res.json({ profilePic: updatedUser.profilePic });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;
