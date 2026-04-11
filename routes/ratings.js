const express = require('express');
const { body, validationResult } = require('express-validator');
const Donation = require('../models/Donation');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/:donationId', auth, [
  body('packaging').isInt({ min: 1, max: 5 }).withMessage('Packaging rating must be between 1 and 5'),
  body('quality').isInt({ min: 1, max: 5 }).withMessage('Quality rating must be between 1 and 5'),
  body('review').optional().trim().isLength({ max: 500 }).withMessage('Review cannot exceed 500 characters')
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

    const { donationId } = req.params;
    const { packaging, quality, review } = req.body;
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
        message: 'Only the receiver can rate this donation'
      });
    }

    if (!donation.canBeRated()) {
      return res.status(400).json({
        success: false,
        message: 'This donation cannot be rated at this time'
      });
    }

    donation.ratings = {
      packaging,
      quality,
      review: review || null,
      ratedBy: userId,
      ratedAt: new Date()
    };

    donation.status = 'completed';
    donation.completedAt = new Date();

    await donation.save();
    await donation.populate('provider', 'name email entityName');
    await donation.populate('receiver', 'name email');

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      data: { donation }
    });
  } catch (error) {
    console.error('Rating submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting rating'
    });
  }
});

router.get('/provider/:providerId', async (req, res) => {
  try {
    const { providerId } = req.params;
    
    const donations = await Donation.find({
      provider: providerId,
      'ratings.ratedBy': { $exists: true },
      status: 'completed'
    }).select('ratings foodItems createdAt');

    if (donations.length === 0) {
      return res.json({
        success: true,
        data: {
          averageRating: 0,
          totalRatings: 0,
          ratings: []
        }
      });
    }

    const totalRatings = donations.length;
    const averagePackaging = donations.reduce((sum, d) => sum + d.ratings.packaging, 0) / totalRatings;
    const averageQuality = donations.reduce((sum, d) => sum + d.ratings.quality, 0) / totalRatings;
    const averageOverall = (averagePackaging + averageQuality) / 2;

    res.json({
      success: true,
      data: {
        averageRating: Math.round(averageOverall * 10) / 10,
        averagePackaging: Math.round(averagePackaging * 10) / 10,
        averageQuality: Math.round(averageQuality * 10) / 10,
        totalRatings,
        ratings: donations.map(d => ({
          foodItems: d.foodItems,
          date: d.createdAt,
          packaging: d.ratings.packaging,
          quality: d.ratings.quality,
          review: d.ratings.review
        }))
      }
    });
  } catch (error) {
    console.error('Provider ratings fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching provider ratings'
    });
  }
});

router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    let stats;
    if (user.role === 'provider') {
      const donations = await Donation.find({
        provider: userId,
        'ratings.ratedBy': { $exists: true },
        status: 'completed'
      }).select('ratings');

      if (donations.length === 0) {
        stats = {
          averageRating: 0,
          totalRatings: 0,
          averagePackaging: 0,
          averageQuality: 0
        };
      } else {
        const totalRatings = donations.length;
        const averagePackaging = donations.reduce((sum, d) => sum + d.ratings.packaging, 0) / totalRatings;
        const averageQuality = donations.reduce((sum, d) => sum + d.ratings.quality, 0) / totalRatings;
        const averageOverall = (averagePackaging + averageQuality) / 2;

        stats = {
          averageRating: Math.round(averageOverall * 10) / 10,
          averagePackaging: Math.round(averagePackaging * 10) / 10,
          averageQuality: Math.round(averageQuality * 10) / 10,
          totalRatings
        };
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'Only providers can view their rating stats'
      });
    }

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Rating stats fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching rating stats'
    });
  }
});

module.exports = router;
