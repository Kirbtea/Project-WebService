// File: controllers/rentalController.js
const Rental = require('../models/Rental');
const Game = require('../models/Game');
const User = require('../models/User'); // WAJIB TAMBAH INI
const RentalDetail = require('../models/RentalDetail');
const Joi = require('joi');
const axios = require('axios');
// Joi Schema: Memastikan input lama sewa adalah angka dan minimal 1 hari
const createRentalSchema = Joi.object({
  rentalDays: Joi.number().integer().min(1).required().messages({
    'number.base': 'Lama sewa harus berupa angka!',
    'number.min': 'Lama sewa minimal 1 hari!',
    'any.required': 'Lama sewa wajib diisi!'
  })
});
// Joi Schema: Sekarang meminta freetogameId berupa angka
const addItemSchema = Joi.object({
  freetogameId: Joi.number().required().messages({
    'any.required': 'ID dari FreeToGame wajib diisi!',
    'number.base': 'ID harus berupa angka!'
  })
});

// File: controllers/rentalController.js

exports.getMyHistory = async (req, res) => {
  try {
    // Cari semua nota yang pemiliknya adalah user yang sedang login
    // .sort({ createdAt: -1 }) artinya diurutkan dari waktu yang paling baru
    const rentals = await Rental.find({ user: req.user.id }).sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Berhasil menarik riwayat transaksi!",
      total_transaksi: rentals.length,
      data: rentals
    });
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.createRental = async (req, res) => {
  try {
    const { value, error } = createRentalSchema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errorMessages = error.details.map(err => err.message);
      return res.status(400).json({ message: "Validasi Gagal", errors: errorMessages });
    }

    // Perubahan ada di bagian ini
    const newRental = new Rental({
      user: req.user.id,
      rentalDays: value.rentalDays,
      status: 'ongoing', // <-- SUDAH DISESUAIKAN DENGAN ENUM MODELMU
      totalPrice: 0 
    });

    await newRental.save();

    return res.status(201).json({
      message: "Nota sewa (Header) berhasil dibuat! Silakan tambahkan game ke dalam nota ini.",
      rental: newRental
    });

  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.addItemDetail = async (req, res) => {
  try {
    const { value, error } = addItemSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // 1. Cari Nota Header (Rental)
    const rentalHeader = await Rental.findById(req.params.id);
    if (!rentalHeader) return res.status(404).json({ message: "Nota sewa tidak ditemukan!" });
    if (rentalHeader.user.toString() !== req.user.id) return res.status(403).json({ message: "Ini bukan nota sewamu!" });
    if (rentalHeader.status !== 'ongoing') return res.status(400).json({ message: "Nota ini sudah tidak bisa diubah!" });

    // 2. LAZY SYNC: Cek database lokal
    let game = await Game.findOne({ freetogameId: value.freetogameId });

    // Jika game tidak ada di database lokal, tarik dari API!
    if (!game) {
      try {
        const apiResponse = await axios.get(`https://www.freetogame.com/api/game?id=${value.freetogameId}`);
        const apiData = apiResponse.data;

        // Simpan ke database lokal
        game = new Game({
          freetogameId: apiData.id,
          title: apiData.title,
          thumbnail: apiData.thumbnail,
          price: 5000 // Harga default
        });
        await game.save();
      } catch (err) {
        return res.status(404).json({ message: "Game ID tersebut tidak ditemukan di FreeToGame!" });
      }
    }

    // 3. Masukkan ke Nota (RentalDetail)
    const subTotal = game.price * rentalHeader.rentalDays;
    const newDetail = new RentalDetail({
      rental: rentalHeader._id,
      game: game._id,
      subTotal: subTotal
    });
    await newDetail.save();

    // 4. Update Total Harga di Header
    rentalHeader.totalPrice += subTotal;
    await rentalHeader.save();

    return res.status(201).json({
      message: `Berhasil menambahkan ${game.title} ke nota sewa!`,
      detail: newDetail,
      currentTotalHeaderPrice: rentalHeader.totalPrice
    });

  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.checkoutRental = async (req, res) => {
  try {
    // 1. Cari Nota Sewa
    const rental = await Rental.findById(req.params.id);
    if (!rental) {
      return res.status(404).json({ message: "Nota sewa tidak ditemukan!" });
    }

    // 2. Keamanan: Pastikan yang bayar adalah pemilik nota
    if (rental.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Ini bukan nota sewamu!" });
    }

    // 3. Cari Data User untuk mengecek saldo
    const user = await User.findById(req.user.id);

    // 4. Validasi Saldo
    if (user.walletBalance < rental.totalPrice) {
      return res.status(400).json({ 
        message: "Saldo dompet tidak mencukupi!", 
        sisaSaldo: user.walletBalance,
        tagihan: rental.totalPrice
      });
    }

   // 5. Eksekusi Pembayaran (Potong Saldo)
    user.walletBalance -= rental.totalPrice;
    await user.save();

    // --- TAMBAHKAN DUA BARIS INI ---
    // Ubah status nota menjadi selesai karena sudah dibayar
    rental.status = 'completed';
    await rental.save();
    // -------------------------------

    // 6. Berikan Respons Sukses
    return res.status(200).json({
      message: "Pembayaran berhasil! Nota telah selesai (completed).",
      totalBayar: rental.totalPrice,
      sisaSaldo: user.walletBalance,
      statusNota: rental.status
    });

  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Endpoint 6: Membatalkan Nota (Cancel)
exports.cancelRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    
    if (!rental) {
      return res.status(404).json({ message: "Nota sewa tidak ditemukan!" });
    }

    // Pastikan ini nota milik user yang sedang login
    if (rental.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Akses ditolak! Ini bukan nota sewamu." });
    }

    // Cegah pembatalan jika statusnya sudah bukan ongoing
    if (rental.status === 'completed') {
      return res.status(400).json({ message: "Tidak bisa dibatalkan! Nota ini sudah dibayar." });
    }
    if (rental.status === 'cancelled') {
      return res.status(400).json({ message: "Nota ini memang sudah dibatalkan sebelumnya." });
    }

    // Eksekusi pembatalan
    rental.status = 'cancelled';
    await rental.save();

    return res.status(200).json({
      message: "Berhasil! Nota sewa telah dibatalkan.",
      statusNota: rental.status
    });

  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Endpoint 6: Membatalkan Nota (Cancel)
exports.cancelRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    
    if (!rental) {
      return res.status(404).json({ message: "Nota sewa tidak ditemukan!" });
    }

    // Pastikan ini nota milik user yang sedang login
    if (rental.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Akses ditolak! Ini bukan nota sewamu." });
    }

    // Cegah pembatalan jika statusnya sudah bukan ongoing
    if (rental.status === 'completed') {
      return res.status(400).json({ message: "Tidak bisa dibatalkan! Nota ini sudah dibayar." });
    }
    if (rental.status === 'cancelled') {
      return res.status(400).json({ message: "Nota ini memang sudah dibatalkan sebelumnya." });
    }

    // Eksekusi pembatalan
    rental.status = 'cancelled';
    await rental.save();

    return res.status(200).json({
      message: "Berhasil! Nota sewa telah dibatalkan.",
      statusNota: rental.status
    });

  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};