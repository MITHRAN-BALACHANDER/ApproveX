import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './utils/logger.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import roleBasedAuth from './routes/roleBasedAuth.js';
import dutyRequestRoutes from './routes/dutyRequestRoutes.js';
import leaveRequestRoutes from './routes/leaveRequestRoutes.js';
import testRoutes from './routes/testRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import passwordRoutes from './routes/passwordRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Trust proxy (for deployments behind reverse proxies)
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// CORS: allow all origins
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic rate limiter for all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
});
app.use(limiter);
// Serve frontend build (React/Vue/etc.)
//  app.use(express.static(path.join(__dirname, 'public')));

// Catch-all route: send index.html for client-side routing (SPA)
// app.get('*', (req, res) => {
//   res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
// });



// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/role-auth', roleBasedAuth);
app.use('/api/duty-requests', dutyRequestRoutes);
app.use('/api/leave-requests', leaveRequestRoutes);
app.use('/api/test', testRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/password', passwordRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Student On Duty Request API is running!' });
});

// MongoDB Atlas connection only
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  logger.error('❌ MONGODB_URI environment variable is not set');
  logger.info('💡 Please set MONGODB_URI in your .env file');
  process.exit(1);
}

logger.info('Attempting to connect to MongoDB Atlas...');

// Start server only after DB connection
mongoose.connect(MONGODB_URI)
  .then(() => {
    logger.info('✅ Connected to MongoDB Atlas successfully!');
    app.listen(PORT, () => {
      logger.info(`🚀 Server is running on port ${PORT}`);
      logger.info(`📡 API available at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    logger.error(`❌ MongoDB Atlas connection error: ${error.message}`);
    logger.info('💡 Please check your MongoDB Atlas credentials and network connection');
    process.exit(1);
  });

// Error handling middleware
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  logger.error(error);
  res.status(500).json({ message: 'Something went wrong!' });
});
