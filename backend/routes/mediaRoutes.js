// 📁 routes/mediaRoutes.js
const express = require("express");
const multer = require("multer");
const { uploadFileToS3 } = require("../utils/uploadFile");
const Media = require("../models/Media");
const { protect } = require("../middleware/authMiddleware");
const s3Client = require("../config/s3");
const { DeleteObjectCommand, DeleteObjectsCommand } = require("@aws-sdk/client-s3");
const { toggleFavorite, getFavorites } = require("../controllers/mediaController");
const { searchByAI } = require('../controllers/mediaController');





const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload", protect, upload.single("file"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const fileData = await uploadFileToS3(req.file);
    console.log("USER FROM TOKEN:", req.user);

    const newMedia = await Media.create({
      user: req.user.id,
      fileUrl: fileData.fileUrl,
      key: fileData.key,
      contentType: fileData.contentType,
      title: title || req.file.originalname,
      description,
    });

    res.status(201).json(newMedia);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/all", protect, async (req, res) => {
  try {
    const mediaFiles = await Media.find({ user: req.user._id }).sort({ uploadedAt: -1 });
    res.json(mediaFiles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ message: "Media not found" });

    if (media.user.toString() !== req.user.id)
      return res.status(401).json({ message: "Unauthorized" });

    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: media.key,
    };
    await s3Client.send(new DeleteObjectCommand(deleteParams));
    await Media.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Media deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/delete-many", protect, async (req, res) => {
  try {
    const { ids } = req.body;
    const medias = await Media.find({ _id: { $in: ids }, user: req.user.id });

    const deleteObjects = medias.map((media) => ({
      Key: media.key,
    }));

    await s3Client.send(new DeleteObjectsCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Delete: { Objects: deleteObjects },
    }));

    await Media.deleteMany({ _id: { $in: ids }, user: req.user.id });

    res.status(200).json({ message: "Selected media deleted successfully" });
  } catch (error) {
    console.error("Bulk delete error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.patch("/favorite/:id", protect, toggleFavorite); 
router.get("/favorites", protect, getFavorites); // ✅ NEW

router.patch("/:id", protect, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ message: "Media not found" });
    if (media.user.toString() !== req.user.id) return res.status(403).json({ message: "Unauthorized" });

    media.title = req.body.title || media.title;
    media.description = req.body.description || media.description;
    await media.save();

    res.json(media);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.post('/ai-search', protect, searchByAI);





module.exports = router;
