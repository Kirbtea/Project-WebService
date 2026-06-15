// File: routes/rentalRoutes.js
const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rentalController');

// Import "penjaga gerbang" dari middleware auth
const { verifyToken, isGamer } = require('../middlewares/auth');

// Endpoint: POST /api/rentals
// Alur: Cek Token -> Cek Role Gamer -> Jalankan Controller
router.get('/my-history', verifyToken, isGamer, rentalController.getMyHistory);

router.post('/', verifyToken, isGamer, rentalController.createRental);
router.post('/:id/items', verifyToken, isGamer, rentalController.addItemDetail);
router.put('/:id/checkout', verifyToken, isGamer, rentalController.checkoutRental);
router.put('/:id/cancel', verifyToken, isGamer, rentalController.cancelRental);

router.get('/active',verifyToken,isGamer,rentalController.getActiveRentals);
router.get('/:id',verifyToken,isGamer,rentalController.getRentalDetail);
router.put('/:id',verifyToken,isGamer,rentalController.updateRentalDays);
router.delete('/:rentalId/items/:itemId',verifyToken,isGamer,rentalController.removeRentalItem);

module.exports = router;