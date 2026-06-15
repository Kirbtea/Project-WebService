// File: controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

// Joi Schema yang diperketat (Tidak boleh kosong)
const registerSchema = Joi.object({
  username: Joi.string().trim().min(3).required().messages({
    'string.empty': 'Username tidak boleh kosong sama sekali!',
    'any.required': 'Username wajib diisi!',
    'string.min': 'Username minimal 3 karakter!'
  }),
  email: Joi.string().trim().email().required().messages({
    'string.empty': 'Email tidak boleh kosong sama sekali!',
    'string.email': 'Format email harus valid (menggunakan @)!',
    'any.required': 'Email wajib diisi!'
  }),
  password: Joi.string().trim().min(6).required().messages({
    'string.empty': 'Password tidak boleh kosong sama sekali!',
    'string.min': 'Password minimal 6 karakter!',
    'any.required': 'Password wajib diisi!'
  }),
  role: Joi.string().valid('admin', 'gamer').optional()
});

exports.register = async (req, res) => {
  try {
    // 1. Validasi Input Teks menggunakan Joi
    const { error } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) {
      // Mengambil semua pesan error dari Joi
      const errorMessages = error.details.map(err => err.message);
      return res.status(400).json({ message: "Validasi Gagal", errors: errorMessages });
    }

    // 2. Pengecekan File Multer (Tidak boleh kosong)
    if (!req.file) {
      return res.status(400).json({ 
        message: "Validasi Gagal", 
        errors: ["File gambar KTP/Profil wajib diupload dan tidak boleh kosong!"] 
      });
    }

    const { username, email, password, role } = req.body;

    // 3. Cek Duplikasi
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ message: "Email atau Username sudah terdaftar!" });
    }

    // 4. Hash Password & Save
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      profilePicture: req.file.path,
      role: role || 'gamer'
    });

    await newUser.save();

    return res.status(201).json({
      message: "Registrasi berhasil!",
      user: { id: newUser._id, username: newUser.username, role: newUser.role }
    });

  } catch (error) {
    // Menangkap error dari Multer (misal format file salah)
    if (error.message.includes('Format file ditolak!')) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    'string.empty': 'Email tidak boleh kosong sama sekali!',
    'string.email': 'Format email harus valid (menggunakan @)!',
    'any.required': 'Email wajib diisi saat login!'
  }),
  password: Joi.string().trim().required().messages({
    'string.empty': 'Password tidak boleh kosong sama sekali!',
    'any.required': 'Password wajib diisi saat login!'
  })
});

exports.login = async (req, res) => {
  try {
    // 1. Ambil objek 'value' dari hasil validasi Joi
    const { value, error } = loginSchema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errorMessages = error.details.map(err => err.message);
      return res.status(400).json({ message: "Validasi Login Gagal", errors: errorMessages });
    }

    // 2. Gunakan 'value' yang sudah bersih (ter-trim), BUKAN req.body!
    const { email, password } = value;

    // 3. Cari User di Database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan!" });
    }

    // 4. Cek Kecocokan Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Pastikan menggunakan status 401 (Unauthorized) untuk password salah
      return res.status(401).json({ message: "Password salah!" });
    }

    // 5. Generate JWT Token
    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    return res.status(200).json({
      message: "Login berhasil!",
      token: token
    });

  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password');

    res.status(200).json({
      message: 'Profil berhasil diambil',
      data: user
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};  

exports.updateProfile = async (req, res) => {
  try {
    const { username } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: 'User tidak ditemukan'
      });
    }

    if (username) {
      user.username = username;
    }

    await user.save();

    res.status(200).json({
      message: 'Profil berhasil diperbarui',
      data: user
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.getWallet = async (req, res) => {
  try {

    const user = await User.findById(req.user.id);

    res.status(200).json({
      walletBalance: user.walletBalance
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.topupWallet = async (req, res) => {
  try {

    const schema = Joi.object({
      amount: Joi.number()
        .min(1000)
        .required()
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message
      });
    }

    const { amount } = req.body;

    const user = await User.findById(req.user.id);

    user.walletBalance += amount;

    await user.save();

    res.status(200).json({
      message: 'Top up berhasil',
      walletBalance: user.walletBalance
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};