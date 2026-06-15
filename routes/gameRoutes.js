// File: routes/gameRoutes.js
const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

// Import "penjaga gerbang" dari middleware auth
const { verifyToken } = require('../middlewares/auth');

// Endpoint: GET /api/games/external
router.get('/external', gameController.fetchGamesFromAPI);
router.get('/catalog', verifyToken, gameController.fetchGamesFromAPI);

router.get('/search', gameController.searchGames);
router.get('/:id', gameController.getGameById);
module.exports = router;