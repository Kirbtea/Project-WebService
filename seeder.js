// File: seeder.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env variables
dotenv.config();

// Import Models yang sudah kita buat sebelumnya
const User = require('./models/User');
const Game = require('./models/Game');

// Sambung ke MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected for Seeding...'))
  .catch(err => console.log(err));

// Siapkan Data Dummy untuk di-inject
const importData = async () => {
  try {
    // 1. Bersihkan database terlebih dahulu (opsional tapi disarankan agar tidak duplikat)
    await User.deleteMany();
    await Game.deleteMany();

    console.log('Data lama berhasil dihapus!');

    // 2. Buat password yang sudah di-hash untuk user dummy
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 3. Inject Data Master User
    const users = await User.insertMany([
      {
        username: 'admin_ganteng',
        email: 'admin@rental.com',
        password: hashedPassword,
        profilePicture: 'uploads/default_admin.jpg',
        role: 'admin',
        walletBalance: 9999999
      },
      {
        username: 'gamer_sejati',
        email: 'gamer@rental.com',
        password: hashedPassword,
        profilePicture: 'uploads/default_user.jpg',
        role: 'gamer',
        walletBalance: 50000
      }
    ]);

    // 4. Inject Data Master Game (Bisa dikembangkan dengan fetch ke FreeToGame API di sini)
    await Game.insertMany([
      {
        freetogameId: 1,
        title: 'Overwatch 2',
        genre: 'Shooter',
        platform: 'PC (Windows)',
        thumbnail: 'https://www.freetogame.com/g/540/thumbnail.jpg',
        rentPrice: 15000
      },
      {
        freetogameId: 2,
        title: 'Genshin Impact',
        genre: 'Action RPG',
        platform: 'PC (Windows)',
        thumbnail: 'https://www.freetogame.com/g/475/thumbnail.jpg',
        rentPrice: 20000
      }
    ]);

    console.log('Data sukses di-inject (Seeded)!');
    process.exit(); // Matikan proses setelah selesai

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Matikan proses dengan status error
  }
};

// Panggil fungsinya
importData();