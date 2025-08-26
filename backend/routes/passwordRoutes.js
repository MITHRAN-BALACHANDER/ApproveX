import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendPasswordChangeOTPEmail } from '../utils/emailService.js';

const router = express.Router();

// Middleware to verify user token
const verifyUser = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account deactivated. Contact admin.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

// Request OTP for password change
router.post('/request-password-change-otp', verifyUser, async (req, res) => {
  try {
    const user = req.user;

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in user document
    user.passwordChangeOTP = otp;
    user.passwordChangeOTPExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    await sendPasswordChangeOTPEmail(user.email, otp, user.profile.fullName);

    res.json({
      success: true,
      message: 'OTP sent to your email address',
      expiresIn: '10 minutes'
    });

  } catch (error) {
    console.error('Password change OTP request error:', error);
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
});

// Change password using old password
router.post('/change-password', verifyUser, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = req.user;

    // Validate input
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Old password and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'New password must be at least 6 characters long' 
      });
    }

    // Verify old password
    const isOldPasswordValid = await user.comparePassword(oldPassword);
    if (!isOldPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Check if new password is different from old password
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({ 
        message: 'New password must be different from current password' 
      });
    }

    // Hash new password and update directly to bypass pre-save hook
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword } }
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Failed to change password. Please try again.' });
  }
});

// Change password using OTP
router.post('/change-password-with-otp', verifyUser, async (req, res) => {
  try {
    const { otp, newPassword } = req.body;
    const user = req.user;

    // Validate input
    if (!otp || !newPassword) {
      return res.status(400).json({ 
        message: 'OTP and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'New password must be at least 6 characters long' 
      });
    }

    // Check if OTP exists and is valid
    if (!user.passwordChangeOTP || !user.passwordChangeOTPExpiry) {
      return res.status(400).json({ 
        message: 'No OTP found. Please request a new OTP.' 
      });
    }

    // Check if OTP has expired
    if (new Date() > user.passwordChangeOTPExpiry) {
      return res.status(400).json({ 
        message: 'OTP has expired. Please request a new OTP.' 
      });
    }

    // Verify OTP
    if (user.passwordChangeOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Check if new password is different from old password
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({ 
        message: 'New password must be different from current password' 
      });
    }

    // Hash new password and update directly to bypass pre-save hook
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.updateOne(
      { _id: user._id },
      { 
        $set: { password: hashedPassword },
        $unset: { 
          passwordChangeOTP: 1, 
          passwordChangeOTPExpiry: 1 
        }
      }
    );

    res.json({
      success: true,
      message: 'Password changed successfully using OTP'
    });

  } catch (error) {
    console.error('Password change with OTP error:', error);
    res.status(500).json({ message: 'Failed to change password. Please try again.' });
  }
});

// Verify OTP (without changing password - for validation)
router.post('/verify-password-change-otp', verifyUser, async (req, res) => {
  try {
    const { otp } = req.body;
    const user = req.user;

    if (!otp) {
      return res.status(400).json({ message: 'OTP is required' });
    }

    // Check if OTP exists and is valid
    if (!user.passwordChangeOTP || !user.passwordChangeOTPExpiry) {
      return res.status(400).json({ 
        message: 'No OTP found. Please request a new OTP.' 
      });
    }

    // Check if OTP has expired
    if (new Date() > user.passwordChangeOTPExpiry) {
      return res.status(400).json({ 
        message: 'OTP has expired. Please request a new OTP.' 
      });
    }

    // Verify OTP
    if (user.passwordChangeOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    res.json({
      success: true,
      message: 'OTP verified successfully'
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Failed to verify OTP. Please try again.' });
  }
});

export default router;
