import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT token with role information
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Input validation for auto-login
const autoLoginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

// Auto-detect role login endpoint
router.post('/auto-login', autoLoginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Try to find user with any role
    const user = await User.findOne({ 
      email: email.toLowerCase() 
    });

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ 
        success: false,
        message: 'Account deactivated. Contact admin.' 
      });
    }

    // For students, check email verification
    if (user.role === 'student' && !user.isEmailVerified) {
      return res.status(403).json({ 
        success: false,
        message: 'Email not verified. Please verify your email first.' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    // Prepare user data for response (exclude sensitive information)
    const userData = {
      id: user._id,
      email: user.email,
      role: user.role,
      profile: user.profile,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive
    };

    // Role-specific dashboard routes
    const dashboardRoutes = {
      student: '/student/dashboard',
      teacher: '/teacher/dashboard',
      admin: '/admin/dashboard'
    };

    res.json({
      success: true,
      message: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} login successful`,
      token,
      user: userData,
      role: user.role,
      redirectTo: dashboardRoutes[user.role]
    });

  } catch (error) {
    console.error('Auto-login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login' 
    });
  }
});

// Input validation for role-specific login
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(['student', 'teacher', 'admin'])
    .withMessage('Valid role is required')
];

// Unified login endpoint for all roles
router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { email, password, role } = req.body;

    // Find user by email and role
    const user = await User.findOne({ 
      email: email.toLowerCase(), 
      role 
    });

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: `Invalid credentials or not a ${role}` 
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ 
        success: false,
        message: 'Account deactivated. Contact admin.' 
      });
    }

    // For students, check email verification
    if (role === 'student' && !user.isEmailVerified) {
      return res.status(403).json({ 
        success: false,
        message: 'Email not verified. Please verify your email first.' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    // Prepare user data for response (exclude sensitive information)
    const userData = {
      id: user._id,
      email: user.email,
      role: user.role,
      profile: user.profile,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive
    };

    // Role-specific dashboard routes
    const dashboardRoutes = {
      student: '/student/dashboard',
      teacher: '/teacher/dashboard',
      admin: '/admin/dashboard'
    };

    res.json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} login successful`,
      token,
      user: userData,
      redirectTo: dashboardRoutes[role]
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login' 
    });
  }
});

// Get current user information (for all roles)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    // Role-specific dashboard routes
    const dashboardRoutes = {
      student: '/student/dashboard',
      teacher: '/teacher/dashboard',
      admin: '/admin/dashboard'
    };

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive
      },
      defaultRoute: dashboardRoutes[user.role]
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching user information' 
    });
  }
});

// Logout endpoint (token invalidation - client-side for now)
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // For now, we'll handle logout on client-side by removing tokens
    // In a production environment, you might want to implement token blacklisting
    
    res.json({
      success: true,
      message: 'Logout successful',
      redirectTo: '/login'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during logout' 
    });
  }
});

// Verify token and get user role (for route protection)
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      success: true,
      valid: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    res.status(401).json({ 
      success: false,
      valid: false,
      message: 'Invalid or expired token' 
    });
  }
});

// Change password (for all roles)
router.put('/change-password', authenticateToken, [
  body('currentPassword')
    .isLength({ min: 6 })
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: 'Current password is incorrect' 
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error changing password' 
    });
  }
});

export default router;
