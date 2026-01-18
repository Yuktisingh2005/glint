const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Set or update PIN
const setPin = async (req, res) => {
  try {
    const { pin } = req.body;
    if (!/^\d{6}$/.test(pin)) {
      return res.status(400).json({ message: "PIN must be 6 digits" });
    }

    const hashedPin = await bcrypt.hash(pin, 10);

    await User.findByIdAndUpdate(
      req.user.id,
      { lockedFolderPin: hashedPin },
      { new: true }
    );

    res.json({ message: "PIN set successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Verify PIN
const verifyPin = async (req, res) => {
  try {
    const { pin } = req.body;
    const user = await User.findById(req.user.id).select("+lockedFolderPin");

    if (!user.lockedFolderPin) {
      return res.status(400).json({ message: "No PIN set yet" });
    }

    const isMatch = await bcrypt.compare(pin, user.lockedFolderPin);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid PIN" });
    }

    res.json({ message: "PIN verified" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Check if a PIN is set
const checkPinStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("lockedFolderPin");
    res.json({ hasPin: !!user.lockedFolderPin });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  setPin,
  verifyPin,
  checkPinStatus,
};
