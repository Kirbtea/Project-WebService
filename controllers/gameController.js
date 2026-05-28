// File: controllers/gameController.js
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