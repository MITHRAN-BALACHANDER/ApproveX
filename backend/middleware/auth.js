import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Authentication middleware
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Access token required',
        redirectTo: '/login'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid or inactive user',
        redirectTo: '/login'
      });
    }

    // For students, check email verification
    if (user.role === 'student' && !user.isEmailVerified) {
      return res.status(403).json({ 
        success: false,
        message: 'Email not verified',
        redirectTo: '/verify-email'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expired',
        redirectTo: '/login'
      });
    }
    return res.status(403).json({ 
      success: false,
      message: 'Invalid token',
      redirectTo: '/login'
    });
  }
};

// Role-based authorization middleware with automatic redirects
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required',
        redirectTo: '/login'
      });
    }

    if (!roles.includes(req.user.role)) {
      // Role-specific redirect routes
      const dashboardRoutes = {
        student: '/student/dashboard',
        teacher: '/teacher/dashboard',
        admin: '/admin/dashboard'
      };

      return res.status(403).json({ 
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`,
        redirectTo: dashboardRoutes[req.user.role] || '/login'
      });
    }

    next();
  };
};

// Student-only access
export const requireStudent = authorizeRoles('student');

// Teacher-only access (includes admin)
export const requireTeacher = authorizeRoles('teacher', 'admin');

// Admin-only access
export const requireAdmin = authorizeRoles('admin');
