// File: models/Rental.js
const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rentalDays: { type: Number, required: true }, // Tambahan kolom baru
  rentalDate: { type: Date, default: Date.now },
  totalPrice: { type: Number, default: 0 },
  status: { type: String, enum: ['ongoing', 'completed', 'cancelled'], default: 'ongoing' }
}, { timestamps: true });

module.exports = mongoose.model('Rental', rentalSchema);