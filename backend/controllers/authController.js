import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import asyncHandler from '../middleware/asyncHandler.js';

export const signup = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ error: 'User already exists' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const user = await User.create({ email, password: hashed, name });
  const token = generateToken(user);

  return res.status(201).json({
    token,
    user: { id: user._id, email: user.email, name: user.name, picture: user.picture }
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Google-only users cannot log in with password
  if (!user.password) {
    return res.status(401).json({ error: 'This account uses Google Sign-In. Please use "Continue with Google".' });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = generateToken(user);

  return res.status(200).json({
    token,
    user: { id: user._id, email: user.email, name: user.name, picture: user.picture }
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.status(200).json({ user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, notionToken, notionDbId } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      ...(name && { name }),
      ...(notionToken !== undefined && { notionToken }),
      ...(notionDbId !== undefined && { notionDbId })
    },
    { new: true, select: '-password' }
  );
  return res.status(200).json({ user });
});

// Called after Passport Google strategy succeeds
export const googleCallback = (req, res) => {
  try {
    const user = req.user;
    const token = generateToken(user);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Redirect to frontend with token in query param — frontend stores it
    const userData = encodeURIComponent(JSON.stringify({
      id: user._id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      token
    }));

    res.redirect(`${frontendUrl}/auth/callback?user=${userData}`);
  } catch (err) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
  }
};
