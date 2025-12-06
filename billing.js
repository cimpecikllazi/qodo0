import express from 'express';
import { z } from 'zod';
import stripePackage from 'stripe';
import { User } from '../db.js';
import { STRIPE_SECRET } from '../config.js';

const router = express.Router();

// Initialize Stripe
const stripe = stripePackage(STRIPE_SECRET);

// Define pricing plans
const PLANS = {
  starter: {
    name: 'Starter',
    price: 2900, // $29 in cents
    replies: 50,
    description: 'Perfect for small businesses'
  },
  growth: {
    name: 'Growth',
    price: 5900, // $59 in cents
    replies: 150,
    description: 'Great for growing businesses'
  },
  pro: {
    name: 'Pro',
    price: 9900, // $99 in cents
    replies: 400,
    description: 'Ideal for established businesses'
  }
};

// Create checkout session
router.post('/checkout', async (req, res) => {
  try {
    const { plan, userId } = req.body;
    
    // Validate plan
    if (!PLANS[plan]) {
      return res.status(400).json({ message: 'Invalid plan' });
    }
    
    // Get user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Create or retrieve Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.displayName
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: customerId,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${PLANS[plan].name} Plan`,
            description: PLANS[plan].description
          },
          unit_amount: PLANS[plan].price,
          recurring: {
            interval: 'month'
          }
        },
        quantity: 1
      }],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/reviews?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/pricing`,
      metadata: {
        userId: user.id,
        plan: plan
      }
    });
    
    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's subscription status
router.get('/subscription/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      status: user.subscriptionStatus,
      plan: user.currentPlan,
      usageCount: user.usageCount
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
export { PLANS };