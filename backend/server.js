const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require('./routes/userRoutes');
const authRoutes = require("./routes/authRoutes");
const mediaRoutes = require("./routes/mediaRoutes");
const momentsRoutes = require("./routes/moments");
const lockedFolderRoutes = require("./routes/lockedFolderRoutes");
const otpRoutes = require("./routes/otpRoutes");

dotenv.config();
connectDB();  // Ensure the DB connection is established.

const app = express();
app.use(cors());
app.use(express.json());

// Routes for authentication
app.use("/api/auth", authRoutes);

// Routes for media handling
app.use("/api/media", mediaRoutes);

app.use('/api/user', userRoutes);

app.use("/api/moments", momentsRoutes);

app.use('/api/ai', require('./routes/aiRoutes'));
// Locked folder routes
app.use("/api/locked-folder", lockedFolderRoutes);

app.use("/api/auth", otpRoutes);


// Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
