const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');

//  @desc       Get all Users
//  @route      GET /api/v1/users
router.get('/', async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash');
    if (!users) {
      return res.sendStatus(400);
    }
    res.status(200).json({
      success: true,
      data: {
        users,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: err,
    });
  }
});

//  @desc       Get Single User
//  @route      GET /api/v1/users/:id
router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
      return res.status(500).json({
        success: false,
        message: `The user with the given ID (${req.params.id}) was not Found`,
      });
    }
    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: 'Something went wrong',
      error: err,
    });
  }
});

//  @desc       POST  User
//  @route      POST /api/v1/users
router.post('/register', async (req, res, next) => {
  try {
    let user = new User({
      name: req.body.name,
      email: req.body.email,
      passwordHash: bcrypt.hashSync(req.body.password, 12),
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      apartment: req.body.apartment,
      zip: req.body.zip,
      city: req.body.city,
      country: req.body.country,
    });
    user = await user.save();
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'The user can not be created',
      });
    }
    res.status(201).json({
      message: 'success',
      data: {
        user,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: err,
    });
  }
});

//  @desc       Login user
//  @route      POST / api/v1/users/login
router.post('/login', async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    const secret = process.env.SECRET_KEY;
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: 'The user was not Found' });

    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
      const token = jwt.sign(
        { userId: user.id, isAdmin: user.isAdmin },
        secret,
        {
          expiresIn: '1d',
        }
      );
      return res
        .status(200)
        .json({ success: true, data: { user: user.email, token } });
    } else {
      res.status(400).json({ success: false, message: 'Invalid Credential' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, err });
  }
});

//  @desc       Count users number
//  @route      GET /api/v1/users/get/count
router.get('/get/count', async (req, res, next) => {
  try {
    const userCount = await User.countDocuments((count) => count);
    if (!userCount) {
      return res.status(500).json({ success: false });
    }
    res.status(200).json({ success: true, data: { userCount } });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err });
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'User not Found' });
    }
    user = User.findByIdAndRemove(req.params.id);
    res.status(200).json({ success: true, message: 'User Deleted' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, err });
  }
});

module.exports = router;
