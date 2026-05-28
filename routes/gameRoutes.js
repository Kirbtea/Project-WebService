// File: routes/gameRoutes.js
const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

// Import "penjaga gerbang" dari middleware auth
const { verifyToken } = require('../middlewares/auth');

// Endpoint: GET /api/games/external
router.get('/external', gameController.fetchGamesFromAPI);
router.get('/catalog', verifyToken, gameController.fetchGamesFromAPI);
module.exports = router;