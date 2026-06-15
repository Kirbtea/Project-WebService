// File: routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const upload = require('../middlewares/upload');
const { verifyToken } = require('../middlewares/auth');

// Endpoint Register (Gunakan middleware upload multer di sini)
// 'profilePicture' adalah nama field/key yang harus dipakai di Postman nanti
router.post('/register', upload.single('profilePicture'), authController.register);

// Endpoint Login (Tidak butuh multer)
router.post('/login', authController.login);

router.get('/profile',verifyToken,authController.getProfile);
router.put('/profile',verifyToken,authController.updateProfile);
router.get('/wallet',verifyToken,authController.getWallet);
router.post('/topup',verifyToken,authController.topupWallet);

module.exports = router;