const express = require('express');
const { body, validationResult } = require('express-validator');
const Donation = require('../models/Donation');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, [
  body('providerType').isIn(['Restaurant', 'Store', 'Individual']).withMessage('Invalid provider type'),
  body('entityName').trim().isLength({ min: 2, max: 100 }).withMessage('Entity name must be between 2 and 100 characters'),
  body('foodItems').trim().isLength({ min: 5, max: 500 }).withMessage('Food items description is required'),
  body('expiryDate').isISO8601().withMessage('Invalid expiry date'),
  body('safetyConfirmed').custom(val => val === true || val === 'true').withMessage('Safety confirmation is required'),
  body('location.address').trim().isLength({ min: 5 }).withMessage('Address is required'),
  body('location.coordinates.lat').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('location.coordinates.lng').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude')
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

    const userId = req.user.userId;
    const user = await User.findById(userId);
    
    if (!user || user.role !== 'provider') {
      return res.status(403).json({
        success: false,
        message: 'Only providers can create donations'
      });
    }

    const {
      providerType,
      entityName,
      foodItems,
      expiryDate,
      safetyConfirmed,
      location,
      notes,
      images
    } = req.body;

    const donation = new Donation({
      provider: userId,
      providerType,
      entityName,
      foodItems,
      expiryDate: new Date(expiryDate),
      safetyConfirmed,
      location,
      notes,
      images
    });

    await donation.save();
    await donation.populate('provider', 'name email');

    res.status(201).json({
      success: true,
      message: 'Donation created successfully',
      data: { donation }
    });
  } catch (error) {
    console.error('Donation creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating donation'
    });
  }
});

router.get('/available', auth, async (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query;
    
    let donations;
    if (lat && lng) {
      donations = await Donation.findByLocation(
        { lat: parseFloat(lat), lng: parseFloat(lng) },
        parseFloat(radius)
      );
    } else {
      donations = await Donation.findAvailable();
    }

    res.json({
      success: true,
      data: { donations }
    });
  } catch (error) {
    console.error('Available donations fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching available donations'
    });
  }
});

router.get('/my', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    
    let donations;
    if (user.role === 'provider') {
      donations = await Donation.find({ provider: userId })
        .populate('receiver', 'name email')
        .sort({ createdAt: -1 });
    } else if (user.role === 'receiver') {
      donations = await Donation.find({ receiver: userId })
        .populate('provider', 'name email entityName')
        .sort({ createdAt: -1 });
    } else {
      return res.status(403).json({
        success: false,
        message: 'Invalid role for this endpoint'
      });
    }

    res.json({
      success: true,
      data: { donations }
    });
  } catch (error) {
    console.error('My donations fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching donations'
    });
  }
});

router.post('/:id/claim', auth, async (req, res) => {
  try {
    const donationId = req.params.id;
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user || user.role !== 'receiver') {
      return res.status(403).json({
        success: false,
        message: 'Only receivers can claim donations'
      });
    }

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    if (!donation.canBeClaimed()) {
      return res.status(400).json({
        success: false,
        message: 'Donation cannot be claimed'
      });
    }

    donation.receiver = userId;
    donation.status = 'claimed';
    donation.claimedAt = new Date();
    await donation.save();
    await donation.populate('provider', 'name email entityName');

    res.json({
      success: true,
      message: 'Donation claimed successfully',
      data: { donation }
    });
  } catch (error) {
    console.error('Donation claim error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error claiming donation'
    });
  }
});

router.post('/:id/receive', auth, async (req, res) => {
  try {
    const donationId = req.params.id;
    const userId = req.user.userId;

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    if (donation.receiver.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only mark as received for your claimed donations'
      });
    }

    if (donation.status !== 'claimed' && donation.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Donation cannot be marked as received'
      });
    }

    donation.status = 'received';
    donation.receivedAt = new Date();
    await donation.save();

    res.json({
      success: true,
      message: 'Donation marked as received successfully',
      data: { donation }
    });
  } catch (error) {
    console.error('Donation receive error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error marking donation as received'
    });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const donationId = req.params.id;
    const donation = await Donation.findById(donationId)
      .populate('provider', 'name email entityName')
      .populate('receiver', 'name email');

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    res.json({
      success: true,
      data: { donation }
    });
  } catch (error) {
    console.error('Donation fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching donation'
    });
  }
});

module.exports = router;
