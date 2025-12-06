import express from 'express';
import passport from 'passport';
import { z } from 'zod';
import { User } from '../db.js';
import { GOOGLE_CALLBACK_URL } from '../config.js';

const router = express.Router();

// Google OAuth strategy setup
import passportGoogle from 'passport-google-oauth20';
const GoogleStrategy = passportGoogle.Strategy;

// Configure Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    let user = await User.findOne({ where: { googleId: profile.id } });
    
    if (user) {
      // Update existing user's tokens
      user.accessToken = accessToken;
      user.refreshToken = refreshToken;
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        googleId: profile.id,
        displayName: profile.displayName,
        email: profile.emails[0].value,
        accessToken: accessToken,
        refreshToken: refreshToken
      });
    }
    
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Initiate Google OAuth login
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email', 'https://www.googleapis.com/auth/business.manage']
}));

// Handle Google OAuth callback
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect to dashboard
    res.redirect(`${process.env.CLIENT_URL}/onboarding`);
  }
);

// Get current user
router.get('/current', (req, res) => {
  if (req.user) {
    res.json({
      id: req.user.id,
      googleId: req.user.googleId,
      displayName: req.user.displayName,
      email: req.user.email,
      subscriptionStatus: req.user.subscriptionStatus,
      currentPlan: req.user.currentPlan,
      usageCount: req.user.usageCount
    });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out' });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Error destroying session' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  });
});

export default router;