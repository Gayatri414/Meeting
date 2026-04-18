import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

export const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID:     process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:  process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5001/api/auth/google/callback',
        scope: ['profile', 'email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log('[PASSPORT] Google Profile:', JSON.stringify(profile, null, 2));

          const email = profile.emails?.[0]?.value?.toLowerCase();
          if (!email) {
            console.error('[PASSPORT] Error: No email found in Google profile');
            return done(new Error('No email from Google'), null);
          }

          const name = profile.displayName || profile.name?.givenName || email.split('@')[0];
          const picture = profile.photos?.[0]?.value || '';

          // Find existing user by googleId or email
          let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });

          if (user) {
            console.log(`[PASSPORT] Found existing user: ${user.email}`);
            // Always update Google info to keep it fresh
            user.googleId = profile.id;
            user.authProvider = 'google';
            if (picture) user.picture = picture;
            if (name) user.name = name;
            await user.save();
          } else {
            console.log(`[PASSPORT] Creating new user: ${email}`);
            // Create new user
            user = await User.create({
              email,
              googleId:     profile.id,
              name,
              picture,
              authProvider: 'google',
              password:     null
            });
          }

          return done(null, user);
        } catch (err) {
          console.error('[PASSPORT] Strategy Error:', err);
          return done(err, null);
        }
      }
    )
  );

  // Minimal serialization — we use JWT, not sessions
  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).select('-password');
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};
