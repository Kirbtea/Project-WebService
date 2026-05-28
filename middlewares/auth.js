// File: middlewares/auth.js
const jwt = require('jsonwebtoken');

// 1. Fungsi Utama: Mengecek apakah user membawa Token yang valid
const verifyToken = (req, res, next) => {
  // Ambil token dari header 'Authorization' di Postman
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formatnya: "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: "Akses ditolak. Token tidak ditemukan!" });
  }

  try {
    // Verifikasi token menggunakan secret key dari .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Simpan data user (id & role) ke dalam req untuk dipakai di controller
    next(); // Lanjut ke controller
  } catch (error) {
    return res.status(403).json({ message: "Token tidak valid atau sudah kedaluwarsa!" });
  }
};

// 2. Fungsi Khusus: Hanya mengizinkan Admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: "Akses ditolak. Endpoint ini khusus Admin!" });
  }
};

// 3. Fungsi Khusus: Hanya mengizinkan Gamer
const isGamer = (req, res, next) => {
  if (req.user && req.user.role === 'gamer') {
    next();
  } else {
    return res.status(403).json({ message: "Akses ditolak. Endpoint ini khusus Gamer!" });
  }
};

module.exports = { verifyToken, isAdmin, isGamer };