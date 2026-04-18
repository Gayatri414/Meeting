import express from 'express';
import passport from 'passport';
import { signup, login, getProfile, updateProfile, googleCallback } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Email/password auth
router.post('/signup', signup);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Google OAuth — initiates the flow (lazy middleware to avoid init-order issues)
router.get('/google', (req, res, next) => {
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
});

// Google OAuth — callback after Google redirects back
router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_failed`,
    session: false
  })(req, res, next);
}, googleCallback);

export default router;
