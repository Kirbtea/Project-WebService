// File: server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan'); // Untuk logging (nilai tambah)

// Load Environment Variables
dotenv.config();

const app = express();
app.set('json spaces', 2);
// Middleware bawaan
app.use(express.json()); // Agar bisa membaca body JSON (untuk Login)
app.use(express.urlencoded({ extended: true })); // Agar bisa membaca form-data (untuk Multer)
app.use(morgan('dev')); // Menampilkan log request di terminal

// Membuat folder uploads bisa diakses secara publik (opsional, agar gambar bisa dibuka di browser)
app.use('/uploads', express.static('uploads'));

// Koneksi ke Database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Berhasil terhubung ke MongoDB (ProjectWS)'))
  .catch((err) => console.error('❌ Gagal terhubung ke MongoDB:', err));

// Routing
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Routing
const rentalRoutes = require('./routes/rentalRoutes');
app.use('/api/rentals', rentalRoutes);

// Routing
// Routing di server.js (Pastiin baris ini ada)
const gameRoutes = require('./routes/gameRoutes');
app.use('/api/games', gameRoutes);

// Jalankan Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});