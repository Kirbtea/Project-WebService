const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Joi = require('joi');

const topupSchema = Joi.object({
  amount: Joi.number().min(1000).required()
});

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    return res.status(200).json({
      message: "Profil berhasil diambil",
      data: user
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

exports.getWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    return res.status(200).json({
      walletBalance: user.walletBalance
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

exports.topupWallet = async (req, res) => {
  try {
    const { value, error } = topupSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message
      });
    }

    const user = await User.findById(req.user.id);

    user.walletBalance += value.amount;

    await user.save();

    return res.status(200).json({
      message: "Top up berhasil",
      walletBalance: user.walletBalance
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { username } = req.body;

    const user = await User.findById(req.user.id);

    if (username) {
      user.username = username;
    }

    await user.save();

    return res.status(200).json({
      message: "Profil berhasil diperbarui",
      data: user
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(
      oldPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Password lama salah!"
      });
    }

    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(
      newPassword,
      salt
    );

    await user.save();

    return res.status(200).json({
      message: "Password berhasil diubah"
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};