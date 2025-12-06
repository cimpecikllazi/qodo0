import express from 'express';
import { z } from 'zod';
import { User, Location, Review } from '../db.js';
import axios from 'axios';

const router = express.Router();

// Schema for validating location data
const locationSchema = z.object({
  googleLocationId: z.string(),
  name: z.string(),
  address: z.string().optional()
});

// Add location for user
router.post('/locations', async (req, res) => {
  try {
    const { userId, locations } = req.body;
    
    // Validate locations array
    if (!Array.isArray(locations)) {
      return res.status(400).json({ message: 'Locations must be an array' });
    }
    
    // Validate each location
    const validatedLocations = locations.map(location => {
      const result = locationSchema.safeParse(location);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    });
    
    // Get user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Save locations
    const savedLocations = [];
    for (const loc of validatedLocations) {
      const [location, created] = await Location.findOrCreate({
        where: { googleLocationId: loc.googleLocationId, userId: userId },
        defaults: {
          userId: userId,
          googleLocationId: loc.googleLocationId,
          name: loc.name,
          address: loc.address
        }
      });
      
      if (!created) {
        // Update existing location
        location.name = loc.name;
        location.address = loc.address;
        await location.save();
      }
      
      savedLocations.push(location);
    }
    
    res.json(savedLocations);
  } catch (error) {
    console.error('Add locations error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's locations
router.get('/locations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get locations
    const locations = await Location.findAll({
      where: { userId: userId }
    });
    
    res.json(locations);
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get reviews for user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    // Get user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get locations for user
    const locations = await Location.findAll({
      where: { userId: userId },
      attributes: ['id']
    });
    
    const locationIds = locations.map(loc => loc.id);
    
    // Get reviews with pagination
    const offset = (page - 1) * limit;
    const { count, rows } = await Review.findAndCountAll({
      where: { 
        locationId: locationIds,
        replyStatus: 'pending'
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      reviews: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Approve review reply
router.post('/approve/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    // Get review
    const review = await Review.findByPk(reviewId, {
      include: [{
        model: Location,
        include: [{
          model: User
        }]
      }]
    });
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user has available usage
    const user = review.Location.User;
    if (user.usageCount >= getPlanLimit(user.currentPlan)) {
      return res.status(400).json({ message: 'Usage limit exceeded' });
    }
    
    // Update review status
    review.replyStatus = 'approved';
    await review.save();
    
    // Increment user usage
    user.usageCount += 1;
    await user.save();
    
    // TODO: Actually publish reply to Google My Business API
    // This would require implementing the Google My Business API
    
    res.json({ message: 'Review approved and reply scheduled for publishing' });
  } catch (error) {
    console.error('Approve review error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reject review reply
router.post('/reject/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    // Get review
    const review = await Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Update review status
    review.replyStatus = 'rejected';
    await review.save();
    
    res.json({ message: 'Review reply rejected' });
  } catch (error) {
    console.error('Reject review error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Helper function to get plan limit
function getPlanLimit(plan) {
  const limits = {
    starter: 50,
    growth: 150,
    pro: 400
  };
  return limits[plan] || 0;
}

export default router;