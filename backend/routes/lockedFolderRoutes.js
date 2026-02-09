const express = require("express");
const {
  setPin,
  verifyPin,
  checkPinStatus,
} = require("../controllers/lockedFolderController");
const { protect } = require("../middleware/authMiddleware");
const multer = require("multer");
const {
  uploadLockedMedia,
  getLockedMedia, deleteLockedMedia,
  deleteMultipleLockedMedia,
  updateLockedMedia,
} = require("../controllers/lockedMediaController");
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // store in memory temporarily

// PIN routes
router.post("/set-pin", protect, setPin);
router.post("/verify-pin", protect, verifyPin);
router.get("/check-pin", protect, checkPinStatus); // Add this new route

// Locked media routes
router.post("/upload", protect, upload.single("file"), uploadLockedMedia);
router.get("/media", protect, getLockedMedia);
router.patch("/media/:id", protect, updateLockedMedia);
router.delete("/media/:id", protect, deleteLockedMedia);
router.post("/media/delete-multiple", protect, deleteMultipleLockedMedia);

module.exports = router;
