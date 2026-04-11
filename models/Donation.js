const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  missionId: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return `JSR-${Math.floor(1000 + Math.random() * 9000)}`;
    }
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  providerType: {
    type: String,
    enum: ['Restaurant', 'Store', 'Individual'],
    required: true
  },
  entityName: {
    type: String,
    required: true,
    trim: true
  },
  foodItems: {
    type: String,
    required: true,
    trim: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  safetyConfirmed: {
    type: Boolean,
    required: true,
    default: false
  },
  location: {
    address: {
      type: String,
      required: true,
      trim: true
    },
    coordinates: {
      lat: {
        type: Number,
        required: true,
        min: -90,
        max: 90
      },
      lng: {
        type: Number,
        required: true,
        min: -180,
        max: 180
      }
    }
  },
  status: {
    type: String,
    enum: ['available', 'claimed', 'in_progress', 'received', 'completed', 'expired'],
    default: 'available'
  },
  claimedAt: {
    type: Date,
    default: null
  },
  receivedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  ratings: {
    packaging: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    quality: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    review: {
      type: String,
      maxlength: 500,
      default: null
    },
    ratedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    ratedAt: {
      type: Date,
      default: null
    }
  },
  notes: {
    type: String,
    maxlength: 1000,
    default: null
  },
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Please provide valid image URLs'
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

donationSchema.index({ status: 1, expiryDate: 1 });
donationSchema.index({ provider: 1 });
donationSchema.index({ receiver: 1 });
donationSchema.index({ 'location.coordinates': '2dsphere' });

donationSchema.methods.isExpired = function() {
  return new Date() > this.expiryDate;
};

donationSchema.methods.canBeClaimed = function() {
  return this.status === 'available' && !this.isExpired();
};

donationSchema.methods.canBeRated = function() {
  return this.status === 'received' && !this.ratings.packaging && !this.ratings.quality;
};

donationSchema.pre('save', function(next) {
  if (this.isExpired() && this.status === 'available') {
    this.status = 'expired';
  }
  next();
});

donationSchema.statics.findAvailable = function(maxDistance = 50) {
  return this.find({
    status: 'available',
    expiryDate: { $gt: new Date() },
    isActive: true
  }).populate('provider', 'name email entityName');
};

donationSchema.statics.findByLocation = function(coordinates, maxDistance = 50) {
  return this.find({
    status: 'available',
    expiryDate: { $gt: new Date() },
    isActive: true,
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [coordinates.lng, coordinates.lat]
        },
        $maxDistance: maxDistance * 1000
      }
    }
  }).populate('provider', 'name email entityName');
};

module.exports = mongoose.model('Donation', donationSchema);
