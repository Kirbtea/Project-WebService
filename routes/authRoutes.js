// File: routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const upload = require('../middlewares/upload');

// Endpoint Register (Gunakan middleware upload multer di sini)
// 'profilePicture' adalah nama field/key yang harus dipakai di Postman nanti
router.post('/register', upload.single('profilePicture'), authController.register);

// Endpoint Login (Tidak butuh multer)
router.post('/login', authController.login);

module.exports = router;