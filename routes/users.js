const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

router.put('/role', auth, [
  body('role').isIn(['provider', 'receiver']).withMessage('Invalid role specified')
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

    const { role } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role) {
      return res.status(400).json({
        success: false,
        message: 'Role already assigned'
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: 'Role assigned successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Role assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during role assignment'
    });
  }
});

router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    });
  }
});

router.put('/profile', auth, [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email')
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

    const { name, email } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
      user.email = email;
    }

    if (name) user.name = name;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
});

router.get('/providers', auth, async (req, res) => {
  try {
    const providers = await User.find({ 
      role: 'provider', 
      isActive: true 
    }).select('name email entityName createdAt');

    res.json({
      success: true,
      data: { providers }
    });
  } catch (error) {
    console.error('Providers fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching providers'
    });
  }
});

router.get('/receivers', auth, async (req, res) => {
  try {
    const receivers = await User.find({ 
      role: 'receiver', 
      isActive: true 
    }).select('name email ngoName createdAt');

    res.json({
      success: true,
      data: { receivers }
    });
  } catch (error) {
    console.error('Receivers fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching receivers'
    });
  }
});

module.exports = router;
