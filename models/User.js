const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, required: true }, // Path gambar dari Multer
  role: { type: String, enum: ['admin', 'gamer'], default: 'gamer' },
  walletBalance: { type: Number, default: 0 } // Saldo untuk pay-per-use
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);