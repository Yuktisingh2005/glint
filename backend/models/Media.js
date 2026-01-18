// 📁 backend/models/Media.js
const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  key: {
    type: String,
    required: true,
  },
  contentType: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  favoritedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],

  locked: { type: Boolean, default: false },

  // ✅ NEW FIELD FOR AI LABELS
  detectedLabels: {
    type: [String],
    default: [],
  }
});

const Media = mongoose.model("Media", mediaSchema);

module.exports = Media;
