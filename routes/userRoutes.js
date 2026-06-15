const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

const { verifyToken } = require('../middlewares/auth');

router.get(
  '/profile',
  verifyToken,
  userController.getProfile
);

router.put(
  '/profile',
  verifyToken,
  userController.updateProfile
);

router.get(
  '/wallet',
  verifyToken,
  userController.getWallet
);

router.post(
  '/topup',
  verifyToken,
  userController.topupWallet
);

router.put(
  '/change-password',
  verifyToken,
  userController.changePassword
);

module.exports = router;