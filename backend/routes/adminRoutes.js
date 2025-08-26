import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import DutyRequest from '../models/DutyRequest.js';
import { sendTeacherInviteEmail } from '../utils/emailService.js';

const router = express.Router();

// Middleware to verify admin role
const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin user
    const admin = await User.findOne({ email, role: 'admin' });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials or not an admin' });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        fullName: admin.profile.fullName,
        role: admin.role,
        adminLevel: admin.profile.adminLevel
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get admin dashboard stats
router.get('/dashboard', verifyAdmin, async (req, res) => {
  try {
    // Get counts
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalRequests = await DutyRequest.countDocuments();
    const pendingRequests = await DutyRequest.countDocuments({ overallStatus: 'submitted' });
    const approvedRequests = await DutyRequest.countDocuments({ overallStatus: 'approved' });
    const rejectedRequests = await DutyRequest.countDocuments({ overallStatus: 'rejected' });

    // Get recent requests
    const recentRequests = await DutyRequest.find()
      .populate('studentId', 'profile.fullName email')
      .sort({ submittedAt: -1 })
      .limit(5)
      .select('studentInfo eventDetails.eventTitle overallStatus submittedAt');

    // Get teacher approval stats
    const teacherStats = await User.aggregate([
      { $match: { role: 'teacher' } },
      {
        $project: {
          fullName: '$profile.fullName',
          employeeId: '$profile.employeeId',
          designation: '$profile.designation',
          approvalStats: 1
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalTeachers,
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests
      },
      recentRequests,
      teacherStats
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new teacher
router.post('/teachers', verifyAdmin, async (req, res) => {
  try {
    const {
      email,
      fullName,
      employeeId,
      designation,
      department,
      sendInvite = true
    } = req.body;

    // Check if teacher already exists
    const existingTeacher = await User.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({ message: 'Teacher with this email already exists' });
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);

    // Create teacher user
    const teacher = new User({
      email,
      password: tempPassword,
      role: 'teacher',
      profile: {
        fullName,
        employeeId,
        designation,
        department,
        createdBy: req.user._id
      },
      isEmailVerified: true // Admin created accounts are pre-verified
    });

    await teacher.save();

    // Send invite email if requested
    if (sendInvite) {
      await sendTeacherInviteEmail(email, tempPassword, fullName, designation);
    }

    res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      teacher: {
        id: teacher._id,
        email: teacher.email,
        fullName: teacher.profile.fullName,
        employeeId: teacher.profile.employeeId,
        designation: teacher.profile.designation,
        department: teacher.profile.department
      },
      tempPassword: sendInvite ? undefined : tempPassword
    });
  } catch (error) {
    console.error('Create teacher error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all teachers
router.get('/teachers', verifyAdmin, async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' })
      .populate('profile.createdBy', 'profile.fullName')
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      teachers
    });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update teacher
router.put('/teachers/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const teacher = await User.findOneAndUpdate(
      { _id: id, role: 'teacher' },
      { $set: { profile: { ...updates } } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json({
      success: true,
      message: 'Teacher updated successfully',
      teacher
    });
  } catch (error) {
    console.error('Update teacher error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Deactivate/activate teacher
router.patch('/teachers/:id/toggle-status', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await User.findOne({ _id: id, role: 'teacher' });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    teacher.isActive = !teacher.isActive;
    await teacher.save();

    res.json({
      success: true,
      message: `Teacher ${teacher.isActive ? 'activated' : 'deactivated'} successfully`,
      teacher: {
        id: teacher._id,
        fullName: teacher.profile.fullName,
        isActive: teacher.isActive
      }
    });
  } catch (error) {
    console.error('Toggle teacher status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get approval history for all teachers
router.get('/approval-history', verifyAdmin, async (req, res) => {
  try {
    const { teacherId, startDate, endDate, status } = req.query;

    // Build filter query
    let matchQuery = {};
    if (teacherId) {
      matchQuery['approvalHistory.reviewedBy'] = teacherId;
    }
    if (startDate || endDate) {
      matchQuery['approvalHistory.reviewedAt'] = {};
      if (startDate) matchQuery['approvalHistory.reviewedAt'].$gte = new Date(startDate);
      if (endDate) matchQuery['approvalHistory.reviewedAt'].$lte = new Date(endDate);
    }
    if (status) {
      matchQuery['approvalHistory.action'] = status;
    }

    const approvalHistory = await DutyRequest.aggregate([
      { $unwind: '$approvalHistory' },
      { $match: matchQuery },
      {
        $lookup: {
          from: 'users',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'approvalHistory.reviewedBy',
          foreignField: '_id',
          as: 'reviewer'
        }
      },
      {
        $project: {
          requestId: '$_id',
          eventTitle: '$eventDetails.eventTitle',
          studentName: '$studentInfo.fullName',
          studentRegNo: '$studentInfo.registerNumber',
          reviewerName: '$approvalHistory.reviewerName',
          reviewerRole: '$approvalHistory.reviewerRole',
          action: '$approvalHistory.action',
          remarks: '$approvalHistory.remarks',
          reviewedAt: '$approvalHistory.reviewedAt',
          overallStatus: 1
        }
      },
      { $sort: { reviewedAt: -1 } }
    ]);

    res.json({
      success: true,
      approvalHistory
    });
  } catch (error) {
    console.error('Approval history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get teacher performance report
router.get('/teachers/:id/performance', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const teacher = await User.findOne({ _id: id, role: 'teacher' });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Build date filter
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter['approvalHistory.reviewedAt'] = {};
      if (startDate) dateFilter['approvalHistory.reviewedAt'].$gte = new Date(startDate);
      if (endDate) dateFilter['approvalHistory.reviewedAt'].$lte = new Date(endDate);
    }

    // Get detailed performance stats
    const performance = await DutyRequest.aggregate([
      { $unwind: '$approvalHistory' },
      {
        $match: {
          'approvalHistory.reviewedBy': teacher._id,
          ...dateFilter
        }
      },
      {
        $group: {
          _id: '$approvalHistory.action',
          count: { $sum: 1 },
          avgResponseTime: { $avg: { $subtract: ['$approvalHistory.reviewedAt', '$submittedAt'] } }
        }
      }
    ]);

    // Get recent approvals
    const recentApprovals = await DutyRequest.find({
      'approvalHistory.reviewedBy': teacher._id,
      ...dateFilter
    })
      .populate('studentId', 'profile.fullName')
      .sort({ 'approvalHistory.reviewedAt': -1 })
      .limit(10)
      .select('studentInfo eventDetails.eventTitle approvalHistory overallStatus');

    res.json({
      success: true,
      teacher: {
        id: teacher._id,
        fullName: teacher.profile.fullName,
        designation: teacher.profile.designation,
        approvalStats: teacher.approvalStats
      },
      performance,
      recentApprovals
    });
  } catch (error) {
    console.error('Teacher performance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
