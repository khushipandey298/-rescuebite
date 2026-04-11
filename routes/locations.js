const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const DEFAULT_JSR_COORDS = {
  lat: process.env.DEFAULT_LAT || 22.8046,
  lng: process.env.DEFAULT_LNG || 86.2029
};

const JAMSHEDPUR_AREAS = [
  { name: 'Telco', lat: 22.8071, lng: 86.2039 },
  { name: 'Kadma', lat: 22.7914, lng: 86.1854 },
  { name: 'Bistupur', lat: 22.8046, lng: 86.2029 },
  { name: 'Sakchi', lat: 22.8156, lng: 86.2208 },
  { name: 'Mango', lat: 22.8456, lng: 86.2405 },
  { name: 'Jugsalai', lat: 22.7856, lng: 86.1804 },
  { name: 'Golmuri', lat: 22.8256, lng: 86.2308 },
  { name: 'Baridih', lat: 22.7756, lng: 86.1704 },
  { name: 'Tatanagar', lat: 22.8046, lng: 86.2029 },
  { name: 'Adityapur', lat: 22.7956, lng: 86.1904 }
];

router.get('/default', (req, res) => {
  res.json({
    success: true,
    data: {
      coordinates: DEFAULT_JSR_COORDS,
      message: 'Default Jamshedpur coordinates'
    }
  });
});

router.get('/areas', (req, res) => {
  res.json({
    success: true,
    data: {
      areas: JAMSHEDPUR_AREAS,
      total: JAMSHEDPUR_AREAS.length
    }
  });
});

router.post('/geocode', [
  body('address').trim().isLength({ min: 3 }).withMessage('Address must be at least 3 characters long')
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

    const { address } = req.body;
    const lowerAddress = address.toLowerCase();

    const matchedArea = JAMSHEDPUR_AREAS.find(area => 
      area.name.toLowerCase().includes(lowerAddress) || 
      lowerAddress.includes(area.name.toLowerCase())
    );

    if (matchedArea) {
      res.json({
        success: true,
        data: {
          coordinates: {
            lat: matchedArea.lat,
            lng: matchedArea.lng
          },
          area: matchedArea.name,
          confidence: 'high'
        }
      });
    } else {
      const randomArea = JAMSHEDPUR_AREAS[Math.floor(Math.random() * JAMSHEDPUR_AREAS.length)];
      res.json({
        success: true,
        data: {
          coordinates: {
            lat: randomArea.lat + (Math.random() - 0.5) * 0.01,
            lng: randomArea.lng + (Math.random() - 0.5) * 0.01
          },
          area: randomArea.name,
          confidence: 'low',
          message: 'Area not found, using nearby coordinates'
        }
      });
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during geocoding'
    });
  }
});

router.post('/reverse-geocode', [
  body('lat').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('lng').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude')
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

    const { lat, lng } = req.body;
    const latFloat = parseFloat(lat);
    const lngFloat = parseFloat(lng);

    let closestArea = null;
    let minDistance = Infinity;

    JAMSHEDPUR_AREAS.forEach(area => {
      const distance = Math.sqrt(
        Math.pow(latFloat - area.lat, 2) + Math.pow(lngFloat - area.lng, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestArea = area;
      }
    });

    if (closestArea && minDistance < 0.05) {
      res.json({
        success: true,
        data: {
          area: closestArea.name,
          coordinates: { lat: closestArea.lat, lng: closestArea.lng },
          distance: Math.round(minDistance * 111000),
          confidence: 'high'
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          area: 'Unknown Area',
          coordinates: { lat: latFloat, lng: lngFloat },
          confidence: 'low',
          message: 'Location not in known Jamshedpur areas'
        }
      });
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during reverse geocoding'
    });
  }
});

router.get('/distance', (req, res) => {
  const { lat1, lng1, lat2, lng2 } = req.query;

  if (!lat1 || !lng1 || !lat2 || !lng2) {
    return res.status(400).json({
      success: false,
      message: 'All coordinates (lat1, lng1, lat2, lng2) are required'
    });
  }

  try {
    const lat1Float = parseFloat(lat1);
    const lng1Float = parseFloat(lng1);
    const lat2Float = parseFloat(lat2);
    const lng2Float = parseFloat(lng2);

    const R = 6371;
    const dLat = (lat2Float - lat1Float) * Math.PI / 180;
    const dLng = (lng2Float - lng1Float) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1Float * Math.PI / 180) * Math.cos(lat2Float * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    res.json({
      success: true,
      data: {
        distance: Math.round(distance * 100) / 100,
        unit: 'km',
        coordinates: {
          from: { lat: lat1Float, lng: lng1Float },
          to: { lat: lat2Float, lng: lng2Float }
        }
      }
    });
  } catch (error) {
    console.error('Distance calculation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error calculating distance'
    });
  }
});

module.exports = router;
