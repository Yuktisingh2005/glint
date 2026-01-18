const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profilePic: { type: String },
  profilePicKey: { type: String },
  password: { type: String, select: false }, // select:false so password is excluded by default
  googleId: { type: String }, // ✅ Store Google ID
  isGoogleUser: { type: Boolean, default: false }, // ✅ Track Google accounts
  birthDate: { type: Date },
  joinedAt: { type: Date, default: Date.now },
  lockedFolderPin: {
    type: String, // hashed 6-digit PIN
    select: false, // don’t return by default
  },
  lockedMedia: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Media",
    },
  ],

});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
