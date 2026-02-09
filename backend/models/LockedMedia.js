// LockedMedia.js
const mongoose = require("mongoose");

const lockedMediaSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fileUrl: { type: String, required: true },
  key: { type: String, required: true }, // AWS S3 key
  contentType: { type: String, required: true },
  title: { type: String, default: "" },
  description: { type: String, default: "" },
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("LockedMedia", lockedMediaSchema);
