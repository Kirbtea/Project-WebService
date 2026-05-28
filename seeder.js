// File: seeder.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('./models/User');
const Game = require('./models/Game');
const Rental = require('./models/Rental');
const RentalDetail = require('./models/RentalDetail');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Terhubung ke MongoDB untuk Seeding...');

    // 1. Reset/Hapus semua data di database
    await User.deleteMany();
    await Game.deleteMany();
    await Rental.deleteMany();
    await RentalDetail.deleteMany();
    console.log('Semua data lama berhasil dihapus!');

    // 2. Buat Password yang sudah di-hash
    const hashedPassword = await bcrypt.hash('password123', 10);

    // 3. Masukkan 2 User Dummy (Admin & Gamer)
    await User.insertMany([
      {
        username: 'Admin Super',
        email: 'admin@rental.com',
        password: hashedPassword,
        role: 'admin',
        profilePicture: 'default_admin.jpg',
        walletBalance: 0
      },
      {
        username: 'Gamer Sejati',
        email: 'gamer@rental.com',
        password: hashedPassword,
        role: 'gamer',
        profilePicture: 'default_gamer.jpg',
        walletBalance: 50000 // Punya saldo awal buat ngetes
      }
    ]);

    console.log('Data User (Admin & Gamer) berhasil dibuat!');
    console.log('Seeding selesai!');
    process.exit();
  } catch (error) {
    console.error('Error saat seeding:', error);
    process.exit(1);
  }
};

seedDB();