const s3Client = require("../config/s3");
const { Upload } = require("@aws-sdk/lib-storage");

const Media = require("../models/Media");
const analyzeImage = require("../utils/analyzeImage"); // 👈 import Rekognition utility

// Upload file to S3
const uploadFile = async (file) => {
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: file.originalname,
      Body: file.buffer,
      ContentType: file.mimetype,
    },
  });

  return await upload.done();
};

// Upload media and analyze with Rekognition
const uploadMedia = async (req, res) => {
  try {
    const file = req.file;
    const userId = req.user.id || req.body.userId; // support both auth + manual POST
    const locked = req.body.locked === "true";

    if (!file) {
      return res.status(400).json({ message: "No file provided" });
    }

    // Step 1: Upload file to S3
    const result = await uploadFile(file);

    const fileUrl = result.Location;
    const key = file.originalname; // same as Key in upload
    const contentType = file.mimetype;

    // Step 2: Analyze image using AWS Rekognition
    const labels = await analyzeImage(process.env.AWS_BUCKET_NAME, key); // 👈 core AI

    // Step 3: Save to MongoDB
    const media = new Media({
      userId,
      fileUrl,
      key,
      contentType,
      uploadedAt: new Date(),
      detectedLabels: labels,
      locked, 
    });

    await media.save();

    res.status(200).json({
      message: "File uploaded and analyzed successfully",
      media,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};

// Toggle Favorite
const toggleFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const mediaId = req.params.id;

    const media = await Media.findById(mediaId);
    if (!media) return res.status(404).json({ message: "Media not found" });

    const alreadyFavorited = media.favoritedBy.includes(userId);

    if (alreadyFavorited) {
      media.favoritedBy.pull(userId);
    } else {
      media.favoritedBy.push(userId);
    }

    await media.save();
    res.status(200).json({ favorited: !alreadyFavorited, media });
  } catch (error) {
    console.error("Toggle favorite error:", error);
    res.status(500).json({ message: "Toggle favorite failed", error });
  }
};

// Get Favorites
const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const favorites = await Media.find({ favoritedBy: userId }).sort({ uploadedAt: -1 });
    res.status(200).json(favorites);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ message: "Failed to fetch favorites", error });
  }
};
// 🔍 AI Search: find media using labels
const searchByAI = async (req, res) => {
  const { prompt } = req.body;
  const userId = req.user.id;


  if (!prompt) return res.status(400).json({ error: "Search prompt required" });

  try {
    // Convert prompt into lowercase search tokens
    const keywords = prompt.toLowerCase().split(" ");

    // Find media for this user with matching labels
    const media = await Media.find({
  userId, // not `user`
  detectedLabels: { $in: keywords },
})
.sort({ uploadedAt: -1 });

    res.status(200).json({ success: true, media });
  } catch (err) {
    res.status(500).json({ error: "Failed to search media", details: err.message });
  }
};


module.exports = { uploadMedia, toggleFavorite, getFavorites, searchByAI };

