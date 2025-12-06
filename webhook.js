import express from 'express';
import stripePackage from 'stripe';
import { User } from '../db.js';
import { STRIPE_WEBHOOK_SECRET } from '../config.js';

const router = express.Router();

// Initialize Stripe
const stripe = stripePackage(STRIPE_SECRET);

// Webhook handler
router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle the event
  switch (event.type) {
    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      const userId = invoice.metadata.userId;
      
      if (userId) {
        try {
          const user = await User.findByPk(userId);
          if (user) {
            // Reset usage count and update subscription status
            user.usageCount = 0;
            user.subscriptionStatus = 'active';
            user.usageResetDate = new Date();
            await user.save();
            
            console.log(`Usage reset for user ${userId}`);
          }
        } catch (error) {
          console.error('Error updating user subscription:', error);
        }
      }
      break;
      
    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      const subscriptionUserId = subscription.metadata.userId;
      
      if (subscriptionUserId) {
        try {
          const user = await User.findByPk(subscriptionUserId);
          if (user) {
            // Update subscription status
            user.subscriptionStatus = 'inactive';
            await user.save();
            
            console.log(`Subscription cancelled for user ${subscriptionUserId}`);
          }
        } catch (error) {
          console.error('Error updating user subscription status:', error);
        }
      }
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  
  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
});

export default router;