import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/authRoutes.js';
import dutyRequestRoutes from './routes/dutyRequestRoutes.js';
import testRoutes from './routes/testRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/duty-requests', dutyRequestRoutes);
app.use('/api/test', testRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Student On Duty Request API is running!' });
});

// MongoDB connection with Atlas fallback
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/odprovider';
const LOCAL_MONGODB_URI = 'mongodb://localhost:27017/odprovider';

console.log('Attempting to connect to MongoDB at:', MONGODB_URI);

// Try Atlas first, then fallback to local if it fails
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas successfully!');
  })
  .catch((error) => {
    console.error('❌ MongoDB Atlas connection error:', error.message);
    console.log('🔄 Trying to connect to local MongoDB...');
    
    // Fallback to local MongoDB
    mongoose.connect(LOCAL_MONGODB_URI)
      .then(() => {
        console.log('✅ Connected to local MongoDB successfully!');
      })
      .catch((localError) => {
        console.error('❌ Local MongoDB connection also failed:', localError.message);
        console.log('⚠️  Server will start without database connection');
        console.log('💡 Please check your MongoDB Atlas credentials or start local MongoDB');
      });
  });

// Start server regardless of DB connection
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}`);
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: 'Something went wrong!' });
});
