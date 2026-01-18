const express = require('express');
const { searchMediaByAI } = require('../controllers/aiController');
const router = express.Router();

router.post('/search', searchMediaByAI);

module.exports = router;
