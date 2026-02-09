const { uploadFileToS3 } = require("../utils/uploadFile");
const LockedMedia = require("../models/LockedMedia");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const s3Client = require("../config/s3");

// Upload media to locked folder
const uploadLockedMedia = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "No file provided" });
    }

    const fileData = await uploadFileToS3(file);

    const media = new LockedMedia({
      userId: req.user.id,
      fileUrl: fileData.fileUrl,
      key: fileData.key,
      contentType: fileData.contentType,
      title: file.originalname,
    });

    await media.save();

    res.status(200).json({
      message: "Locked media uploaded successfully",
      media,
    });
  } catch (err) {
    console.error("Locked upload error:", err);
    res.status(500).json({
      message: "Upload failed",
      error: err.message,
    });
  }
};

// Fetch all locked media for a user
const getLockedMedia = async (req, res) => {
  try {
    const userId = req.user.id;
    const media = await LockedMedia.find({ userId }).sort({ uploadedAt: -1 });
    res.json(media);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch locked media",
      error: err.message,
    });
  }
};

// Delete a single locked media
const deleteLockedMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const media = await LockedMedia.findOne({ _id: id, userId });
    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }

    // Delete from S3
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: media.key,
      })
    );

    await LockedMedia.findByIdAndDelete(id);

    res.json({ message: "Media deleted successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete media",
      error: err.message,
    });
  }
};

// Delete multiple locked media
const deleteMultipleLockedMedia = async (req, res) => {
  try {
    const { ids } = req.body;
    const userId = req.user.id;

    const mediaDocs = await LockedMedia.find({ _id: { $in: ids }, userId });
    if (!mediaDocs.length) {
      return res.status(404).json({ message: "No media found to delete" });
    }

    // Delete from S3
    for (let media of mediaDocs) {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: media.key,
        })
      );
    }

    await LockedMedia.deleteMany({ _id: { $in: ids }, userId });

    res.json({ message: "Media deleted successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete multiple media",
      error: err.message,
    });
  }
};

// Update locked media description
const updateLockedMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;
    const userId = req.user.id;

    const media = await LockedMedia.findOne({ _id: id, userId });
    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }

    media.description = description || media.description;
    await media.save();

    res.json(media);
  } catch (err) {
    res.status(500).json({
      message: "Failed to update media",
      error: err.message,
    });
  }
};

module.exports = {
  uploadLockedMedia,
  getLockedMedia,
  deleteLockedMedia,
  deleteMultipleLockedMedia,
  updateLockedMedia,
};
