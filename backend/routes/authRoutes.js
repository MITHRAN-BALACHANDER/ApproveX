import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';
import { 
  sendVerificationEmail, 
  generateVerificationToken, 
  parseCollegeEmail,
  sendPasswordResetEmail 
} from '../utils/emailService.js';

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

// College email validation
const collegeEmailValidation = [
  body('collegeEmail')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid college email is required')
    .custom((value) => {
      if (!value.endsWith(`@${process.env.COLLEGE_DOMAIN || 'srishakthi.ac.in'}`)) {
        throw new Error('Please use your college email address');
      }
      return true;
    }),
  body('rollNumber').notEmpty().trim().withMessage('Roll number is required'),
];

// POST /api/auth/register - Step 1: Send verification email
router.post('/register', collegeEmailValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { collegeEmail, rollNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { collegeEmail },
        { rollNumber: rollNumber.toUpperCase() }
      ]
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists with this college email or roll number' 
      });
    }

    // Parse college email to extract student information
    const parseResult = parseCollegeEmail(collegeEmail);
    if (!parseResult.success) {
      return res.status(400).json({ 
        message: parseResult.error 
      });
    }

    const studentInfo = parseResult.data;

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Create user with pending verification
    const user = new User({
      collegeEmail,
      email: collegeEmail, // Use college email as primary email
      rollNumber: rollNumber.toUpperCase(),
      role: 'student',
      profile: {
        fullName: studentInfo.name,
        department: studentInfo.department,
        year: studentInfo.year,
        registerNumber: rollNumber.toUpperCase(),
        section: 'A' // Default section, can be updated later
      },
      password: 'temp_password_will_be_set_during_verification',
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      isActive: false // Account inactive until email verified
    });

    await user.save();

    // Send verification email
    const emailResult = await sendVerificationEmail(
      collegeEmail, 
      verificationToken, 
      studentInfo.name
    );

    if (!emailResult.success) {
      // Delete the user if email sending fails
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({ 
        message: 'Failed to send verification email. Please try again.' 
      });
    }

    res.status(201).json({
      message: 'Registration initiated! Please check your college email for verification instructions.',
      studentInfo: {
        name: studentInfo.name,
        department: studentInfo.department,
        year: studentInfo.year,
        rollNumber: rollNumber.toUpperCase()
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error during registration' });
  }
});

// POST /api/auth/verify-email - Step 2: Verify email and set password
router.post('/verify-email', [
  body('token').notEmpty().withMessage('Verification token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, password } = req.body;

    // Find user with valid verification token
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
      isEmailVerified: false
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired verification token' 
      });
    }

    // Update user - verify email and set password
    user.password = password;
    user.isEmailVerified = true;
    user.isActive = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    // Generate JWT token
    const authToken = generateToken(user._id);

    res.json({
      message: 'Email verified successfully! Account activated.',
      token: authToken,
      user: {
        id: user._id,
        email: user.email,
        collegeEmail: user.collegeEmail,
        rollNumber: user.rollNumber,
        role: user.role,
        profile: user.profile,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Error during email verification' });
  }
});

// POST /api/auth/resend-verification
router.post('/resend-verification', [
  body('collegeEmail').isEmail().normalizeEmail().withMessage('Valid college email is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { collegeEmail } = req.body;

    const user = await User.findOne({ 
      collegeEmail,
      isEmailVerified: false 
    });

    if (!user) {
      return res.status(404).json({ 
        message: 'No pending verification found for this email' 
      });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // Send verification email
    const emailResult = await sendVerificationEmail(
      collegeEmail, 
      verificationToken, 
      user.profile.fullName
    );

    if (!emailResult.success) {
      return res.status(500).json({ 
        message: 'Failed to send verification email. Please try again.' 
      });
    }

    res.json({
      message: 'Verification email sent! Please check your college email.'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Error resending verification email' });
  }
});

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by email or college email
    const user = await User.findOne({ 
      $or: [
        { email },
        { collegeEmail: email }
      ]
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({ 
        message: 'Please verify your email address before logging in',
        needsVerification: true 
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        collegeEmail: user.collegeEmail,
        rollNumber: user.rollNumber,
        role: user.role,
        profile: user.profile,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
});

// Teacher registration route (separate from student auto-registration)
router.post('/register-teacher', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('profile.fullName').notEmpty().trim().withMessage('Full name is required'),
  body('profile.employeeId').notEmpty().trim().withMessage('Employee ID is required'),
  body('profile.designation').notEmpty().trim().withMessage('Designation is required'),
  body('profile.department').notEmpty().trim().withMessage('Department is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, profile } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Check if employee ID already exists
    const existingTeacher = await User.findOne({ 
      'profile.employeeId': profile.employeeId 
    });
    if (existingTeacher) {
      return res.status(400).json({ 
        message: 'Teacher with this employee ID already exists' 
      });
    }

    // Create teacher user
    const user = new User({
      email,
      collegeEmail: email, // For teachers, use regular email
      password,
      role: 'teacher',
      profile,
      isEmailVerified: true, // Teachers don't need email verification for now
      isActive: true
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Teacher registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Teacher registration error:', error);
    res.status(500).json({ message: 'Error creating teacher account' });
  }
});

// GET /api/auth/profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        collegeEmail: req.user.collegeEmail,
        rollNumber: req.user.rollNumber,
        role: req.user.role,
        profile: req.user.profile,
        isEmailVerified: req.user.isEmailVerified,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// POST /api/auth/change-password
router.post('/change-password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    const user = await User.findOne({ 
      $or: [
        { email },
        { collegeEmail: email }
      ]
    });

    if (!user) {
      // Don't reveal if email exists or not
      return res.json({ 
        message: 'If an account with this email exists, a password reset link has been sent.' 
      });
    }

    // Generate reset token
    const resetToken = generateVerificationToken();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.emailVerificationToken = resetToken;
    user.emailVerificationExpires = resetExpires;
    await user.save();

    // Send reset email
    const emailResult = await sendPasswordResetEmail(
      user.email, 
      resetToken, 
      user.profile.fullName
    );

    res.json({ 
      message: 'If an account with this email exists, a password reset link has been sent.' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error processing password reset request' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, newPassword } = req.body;

    // Find user with valid reset token
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token' 
      });
    }

    // Update password
    user.password = newPassword;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

// GET /api/auth/profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        profile: req.user.profile,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// POST /api/auth/change-password
router.post('/change-password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
});

// PUT /api/auth/update-profile
router.put('/update-profile', authenticateToken, [
  body('fullName').notEmpty().trim().withMessage('Full name is required'),
  body('registerNumber').notEmpty().trim().withMessage('Register number is required'),
  body('department').notEmpty().trim().withMessage('Department is required'),
  body('year').notEmpty().trim().withMessage('Year is required'),
  body('section').notEmpty().trim().withMessage('Section is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { fullName, registerNumber, department, year, section } = req.body;
    const userId = req.user._id;

    // Check if register number is already taken by another user
    const existingUser = await User.findOne({ 
      'profile.registerNumber': registerNumber,
      _id: { $ne: userId }
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Register number is already taken by another user' 
      });
    }

    // Update user profile
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          'profile.fullName': fullName,
          'profile.registerNumber': registerNumber,
          'profile.department': department,
          'profile.year': year,
          'profile.section': section,
        }
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.json({ 
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating profile' 
    });
  }
});

export default router;
