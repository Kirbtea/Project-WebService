// File: controllers/gameController.js
const Game = require('../models/Game');
const axios = require('axios');

exports.fetchGamesFromAPI = async (req, res) => {
  try {
    const response = await axios.get('https://www.freetogame.com/api/games');
    
    // Kita ambil 20 game pertama saja agar respons Postman tidak terlalu berat
    const games = response.data.slice(0, 20);

    return res.status(200).json({
      message: "Berhasil menarik data katalog dari FreeToGame!",
      total_data: games.length,
      data: games
    });
  } catch (error) {
    return res.status(500).json({ 
      message: "Gagal terhubung ke server FreeToGame", 
      error: error.message 
    });
  }
};

exports.getGameById = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({
        message: "Game tidak ditemukan"
      });
    }

    return res.status(200).json(game);
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

exports.searchGames = async (req, res) => {
  try {
    const { title } = req.query;

    const games = await Game.find({
      title: {
        $regex: title,
        $options: 'i'
      }
    });

    return res.status(200).json({
      total: games.length,
      data: games
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};