const mongoose = require("mongoose");

const uploadSchema = new mongoose.Schema({
  fileUrl: String,
  fileName: String,
  contentType: String, // ⬅️ This is important
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Upload", uploadSchema);
