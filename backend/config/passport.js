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
          const email = profile.emails?.[0]?.value?.toLowerCase();
          if (!email) return done(new Error('No email from Google'), null);

          // Find existing user by googleId or email
          let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });

          if (user) {
            // Update Google info if signing in with Google for first time on existing account
            if (!user.googleId) {
              user.googleId = profile.id;
              user.authProvider = 'google';
              user.picture = profile.photos?.[0]?.value || user.picture;
              if (!user.name) user.name = profile.displayName;
              await user.save();
            }
          } else {
            // Create new user
            user = await User.create({
              email,
              googleId:     profile.id,
              name:         profile.displayName || email.split('@')[0],
              picture:      profile.photos?.[0]?.value || '',
              authProvider: 'google',
              password:     null
            });
          }

          return done(null, user);
        } catch (err) {
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
