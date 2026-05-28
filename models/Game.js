// File: models/Game.js
const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  freetogameId: { type: Number, required: true, unique: true }, // ID unik dari API
  title: { type: String, required: true },
  thumbnail: { type: String }, // Link gambar dari API
  price: { type: Number, default: 5000 } // Harga sewa default Rp 5.000
}, { timestamps: true });

module.exports = mongoose.model('Game', gameSchema);