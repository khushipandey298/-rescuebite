const express = require('express');
const User = require('../models/User');
const Donation = require('../models/Donation');
const auth = require('../middleware/auth');
const router = express.Router();

const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

router.use(auth);
router.use(adminAuth);

router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalProviders = await User.countDocuments({ role: 'provider', isActive: true });
    const totalReceivers = await User.countDocuments({ role: 'receiver', isActive: true });
    const totalDonations = await Donation.countDocuments();
    const activeDonations = await Donation.countDocuments({ 
      status: { $in: ['available', 'claimed', 'in_progress'] },
      expiryDate: { $gt: new Date() }
    });
    const completedDonations = await Donation.countDocuments({ status: 'completed' });
    const expiredDonations = await Donation.countDocuments({ status: 'expired' });

    const recentDonations = await Donation.find()
      .populate('provider', 'name email')
      .populate('receiver', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    const donationsByStatus = await Donation.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const donationsByType = await Donation.aggregate([
      {
        $match: { status: { $ne: 'expired' } }
      },
      {
        $group: {
          _id: '$providerType',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalProviders,
          totalReceivers,
          totalDonations,
          activeDonations,
          completedDonations,
          expiredDonations
        },
        charts: {
          donationsByStatus,
          donationsByType
        },
        recentDonations
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching admin stats'
    });
  }
});

router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, role, status } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (role) filter.role = role;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching users'
    });
  }
});

router.put('/users/:userId/status', async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify admin user status'
      });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user }
    });
  } catch (error) {
    console.error('User status update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating user status'
    });
  }
});

router.get('/donations', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, providerType } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.status = status;
    if (providerType) filter.providerType = providerType;

    const donations = await Donation.find(filter)
      .populate('provider', 'name email')
      .populate('receiver', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Donation.countDocuments(filter);

    res.json({
      success: true,
      data: {
        donations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Admin donations fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching donations'
    });
  }
});

router.put('/donations/:donationId/status', async (req, res) => {
  try {
    const { donationId } = req.params;
    const { status } = req.body;

    if (!['available', 'claimed', 'in_progress', 'received', 'completed', 'expired'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    donation.status = status;
    
    if (status === 'completed') {
      donation.completedAt = new Date();
    } else if (status === 'expired') {
      donation.expiredAt = new Date();
    }

    await donation.save();
    await donation.populate('provider', 'name email');
    await donation.populate('receiver', 'name email');

    res.json({
      success: true,
      message: 'Donation status updated successfully',
      data: { donation }
    });
  } catch (error) {
    console.error('Donation status update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating donation status'
    });
  }
});

router.delete('/donations/:donationId', async (req, res) => {
  try {
    const { donationId } = req.params;

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    await Donation.findByIdAndDelete(donationId);

    res.json({
      success: true,
      message: 'Donation deleted successfully'
    });
  } catch (error) {
    console.error('Donation deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting donation'
    });
  }
});

router.get('/activity', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const newUsers = await User.countDocuments({ 
      createdAt: { $gte: startDate } 
    });

    const newDonations = await Donation.countDocuments({ 
      createdAt: { $gte: startDate } 
    });

    const completedDonations = await Donation.countDocuments({ 
      completedAt: { $gte: startDate } 
    });

    const dailyActivity = await Donation.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          donations: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          newUsers,
          newDonations,
          completedDonations,
          period: `${days} days`
        },
        dailyActivity
      }
    });
  } catch (error) {
    console.error('Admin activity fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching activity data'
    });
  }
});

module.exports = router;
