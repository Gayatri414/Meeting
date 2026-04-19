import './loadEnv.js'; // must be first — loads .env before any other module
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import passport from 'passport';
import { configurePassport } from './config/passport.js';

import meetingRoutes from './routes/meetingRoutes.js';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import notionRoutes from './routes/notionRoutes.js';
import screenshotRoutes from './routes/screenshotRoutes.js';
import scheduledMeetingRoutes from './routes/scheduledMeetingRoutes.js';
import errorHandler from './middleware/errorHandler.js';

// Configure Passport strategies
configurePassport();

const app = express();

// Security & performance middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));
app.use(passport.initialize());

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', version: '2.0' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meeting', meetingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notion', notionRoutes);
app.use('/api/screenshot', screenshotRoutes);
app.use('/api/scheduled', scheduledMeetingRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ error: `Route ${req.path} not found` }));

// Global error handler (must be last)
app.use(errorHandler);

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, '0.0.0.0', () => console.log(`🚀 MeetAI Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
