const mongoose = require('mongoose');

const rentalDetailSchema = new mongoose.Schema({
  rental: { type: mongoose.Schema.Types.ObjectId, ref: 'Rental', required: true },
  game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
  subTotal: { type: Number, required: true } // Harga sewa pada saat transaksi terjadi
}, { timestamps: true });

module.exports = mongoose.model('RentalDetail', rentalDetailSchema);