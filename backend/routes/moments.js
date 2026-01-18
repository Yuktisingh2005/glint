const express = require("express");
const router = express.Router();
const Media = require("../models/Media");
const { protect } = require("../middleware/authMiddleware");

// GET all media for the logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const media = await Media.find({ user: req.user.id }).sort({ uploadedAt: -1 });
    res.json(media);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch moments" });
  }
});

// PATCH to update media description
router.patch("/:id", protect, async (req, res) => {
  const { description } = req.body;

  try {
    const media = await Media.findOne({ _id: req.params.id, user: req.user.id });
    if (!media) return res.status(404).json({ message: "Media not found" });

    media.description = description;
    await media.save();
    res.json({ message: "Description updated", media });
  } catch (err) {
    res.status(500).json({ message: "Error updating description" });
  }
});

module.exports = router;
