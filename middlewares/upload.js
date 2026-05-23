// File: middlewares/upload.js
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Pengecekan Ekstensi File
const fileFilter = (req, file, cb) => {
  // Daftar ekstensi yang diizinkan
  const allowedTypes = /jpeg|jpg|png/;
  
  // Cek ekstensi file dan mimetype-nya
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    // Jika tidak sesuai, lemparkan error
    return cb(new Error('Format file ditolak! Hanya diperbolehkan upload .jpg, .jpeg, atau .png'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // (Opsional) Maksimal ukuran file 5MB
});

module.exports = upload;