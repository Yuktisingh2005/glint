const Media = require('../models/Media');

// Search media by AI-detected labels
const searchMediaByAI = async (req, res) => {
  const { prompt, userId } = req.body;

  // Step 1: Process prompt into keywords
  const keywords = prompt
    .toLowerCase()
    .replace(/[^\w\s]/gi, '') // remove punctuation
    .split(' ')
    .filter(w => w.length > 2); // ignore short/common words like "is", "a", etc

  try {
    // Step 2: Query DB for media matching keywords in detectedLabels
    const matches = await Media.find({
      userId,
      detectedLabels: { $in: keywords } // any match from prompt
    });

    res.status(200).json(matches);
  } catch (err) {
    res.status(500).json({ error: 'Search failed', details: err.message });
  }
};

// Export for use in routes
module.exports = { searchMediaByAI };
