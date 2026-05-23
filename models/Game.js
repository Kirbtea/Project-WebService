const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  freetogameId: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  genre: { type: String, required: true },
  platform: { type: String, required: true },
  thumbnail: { type: String }, // URL gambar dari FreeToGame
  rentPrice: { type: Number, required: true, default: 15000 } // Harga sewa game per sesi
}, { timestamps: true });

module.exports = mongoose.model('Game', gameSchema);