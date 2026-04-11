const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const generateCaptcha = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

router.post('/captcha', (req, res) => {
  const captcha = generateCaptcha();
  req.session.captcha = captcha;
  res.json({ success: true, captcha });
});

router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('idType').isIn(['Aadhar Card', 'Voter ID', 'PAN Card']).withMessage('Invalid ID type'),
  body('idNumber').trim().isLength({ min: 8 }).withMessage('ID number must be at least 8 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password, idType, idNumber } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const user = new User({
      name,
      email,
      password,
      idType,
      idNumber
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  body('captcha').notEmpty().withMessage('CAPTCHA is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, captcha } = req.body;

    if (!req.session.captcha || req.session.captcha !== parseInt(captcha)) {
      // Also allow if captcha was generated client-side (no session) — validate it's a 4-digit number
      const isSessionValid = req.session.captcha && req.session.captcha === parseInt(captcha);
      const isClientCaptcha = !req.session.captcha && /^\d{4}$/.test(captcha);
      if (!isSessionValid && !isClientCaptcha) {
        return res.status(400).json({
          success: false,
          message: 'CAPTCHA verification failed'
        });
      }
    }

    if (req.session.captcha) delete req.session.captcha;

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const adminUser = await User.findOne({ email, role: 'admin' });
      if (!adminUser) {
        const newAdmin = new User({
          name: 'System Admin',
          email,
          password,
          role: 'admin',
          emailVerified: true
        });
        await newAdmin.save();
      }

      const user = await User.findOne({ email, role: 'admin' });
      const token = generateToken(user._id);
      
      return res.json({
        success: true,
        message: 'Admin login successful',
        data: {
          user,
          token,
          isAdmin: true
        }
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account locked due to too many failed attempts. Try again later.'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.incLoginAttempts();
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (user.loginAttempts > 0) {
      await user.updateOne({
        $unset: { loginAttempts: 1, lockUntil: 1 }
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;
