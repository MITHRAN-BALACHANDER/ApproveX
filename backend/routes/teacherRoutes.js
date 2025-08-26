import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import DutyRequest from '../models/DutyRequest.js';
import { sendApprovalStatusEmail } from '../utils/emailService.js';

const router = express.Router();

// Middleware to verify teacher role
const verifyTeacher = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user || user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied. Teacher privileges required.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account deactivated. Contact admin.' });
    }

    req.teacher = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

// Teacher login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find teacher user
    const teacher = await User.findOne({ email, role: 'teacher' });
    if (!teacher) {
      return res.status(401).json({ message: 'Invalid credentials or not a teacher' });
    }

    if (!teacher.isActive) {
      return res.status(403).json({ message: 'Account deactivated. Contact admin.' });
    }

    // Check password
    const isMatch = await teacher.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: teacher._id, role: teacher.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      teacher: {
        id: teacher._id,
        email: teacher.email,
        fullName: teacher.profile.fullName,
        designation: teacher.profile.designation,
        department: teacher.profile.department,
        role: teacher.role
      }
    });
  } catch (error) {
    console.error('Teacher login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get teacher dashboard
router.get('/dashboard', verifyTeacher, async (req, res) => {
  try {
    // Get pending requests for this teacher's approval level
    const pendingRequests = await DutyRequest.find({
      $or: [
        { 'approvals.mentor.status': 'pending' },
        { 'approvals.hod.status': 'pending' },
        { 'approvals.principal.status': 'pending' }
      ],
      overallStatus: 'submitted'
    })
      .populate('studentId', 'profile.fullName email')
      .sort({ submittedAt: -1 });

    // Get teacher's approval stats
    const stats = req.teacher.approvalStats;

    // Get recent approvals by this teacher
    const recentApprovals = await DutyRequest.find({
      'approvalHistory.reviewedBy': req.teacher._id
    })
      .populate('studentId', 'profile.fullName')
      .sort({ 'approvalHistory.reviewedAt': -1 })
      .limit(5)
      .select('studentInfo eventDetails.eventTitle approvalHistory overallStatus');

    res.json({
      success: true,
      stats,
      pendingRequests,
      recentApprovals
    });
  } catch (error) {
    console.error('Teacher dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all OD requests for approval
router.get('/requests', verifyTeacher, async (req, res) => {
  try {
    const { status, department, page = 1, limit = 10 } = req.query;

    // Build filter query
    let matchQuery = {};
    
    if (status) {
      if (status === 'pending') {
        matchQuery.$or = [
          { 'approvals.mentor.status': 'pending' },
          { 'approvals.hod.status': 'pending' },
          { 'approvals.principal.status': 'pending' }
        ];
      } else {
        matchQuery.overallStatus = status;
      }
    }

    if (department) {
      matchQuery['studentInfo.department'] = department;
    }

    const skip = (page - 1) * limit;

    const requests = await DutyRequest.find(matchQuery)
      .populate('studentId', 'profile.fullName email')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await DutyRequest.countDocuments(matchQuery);

    res.json({
      success: true,
      requests,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: skip + parseInt(limit) < totalCount,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific OD request details
router.get('/requests/:id', verifyTeacher, async (req, res) => {
  try {
    const { id } = req.params;

    const request = await DutyRequest.findById(id)
      .populate('studentId', 'profile.fullName email collegeEmail')
      .populate('approvals.mentor.teacherId', 'profile.fullName profile.designation')
      .populate('approvals.hod.teacherId', 'profile.fullName profile.designation')
      .populate('approvals.principal.teacherId', 'profile.fullName profile.designation')
      .populate('approvalHistory.reviewedBy', 'profile.fullName profile.designation');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json({
      success: true,
      request
    });
  } catch (error) {
    console.error('Get request details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve or reject OD request
router.post('/requests/:id/review', verifyTeacher, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, remarks, approvalLevel } = req.body; // approvalLevel: 'mentor', 'hod', 'principal'

    console.log('📝 Review request received:', {
      requestId: id,
      teacherId: req.teacher._id,
      teacherName: req.teacher.profile.fullName,
      action,
      remarks,
      approvalLevel
    });

    if (!['approved', 'rejected'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Must be approved or rejected.' });
    }

    if (!['mentor', 'hod', 'principal'].includes(approvalLevel)) {
      return res.status(400).json({ message: 'Invalid approval level.' });
    }

    const request = await DutyRequest.findById(id)
      .populate('studentId', 'profile.fullName email');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if already reviewed at this level
    if (request.approvals[approvalLevel].status !== 'pending') {
      return res.status(400).json({ 
        message: `Request already ${request.approvals[approvalLevel].status} at ${approvalLevel} level by ${request.approvals[approvalLevel].reviewedBy}` 
      });
    }

    // Update approval status
    request.approvals[approvalLevel] = {
      teacherId: req.teacher._id,
      status: action,
      remarks: remarks || '',
      approvedAt: new Date(),
      reviewedBy: req.teacher.profile.fullName,
      reviewerDesignation: req.teacher.profile.designation,
      reviewerDepartment: req.teacher.profile.department
    };

    // Add to approval history
    request.approvalHistory.push({
      reviewedBy: req.teacher._id,
      reviewerName: req.teacher.profile.fullName,
      reviewerDesignation: req.teacher.profile.designation,
      reviewerDepartment: req.teacher.profile.department,
      reviewerRole: approvalLevel,
      action,
      remarks: remarks || '',
      reviewedAt: new Date()
    });

    // Update overall status based on approval chain
    if (action === 'rejected') {
      request.overallStatus = 'rejected';
    } else {
      // Check if all required approvals are complete
      const mentorApproved = request.approvals.mentor.status === 'approved';
      const hodApproved = request.approvals.hod.status === 'approved';
      const principalApproved = request.approvals.principal.status === 'approved';

      if (mentorApproved && hodApproved && principalApproved) {
        request.overallStatus = 'approved';
      } else {
        request.overallStatus = 'under_review';
      }
    }

    await request.save();

    // Update teacher's approval stats
    await User.findByIdAndUpdate(req.teacher._id, {
      $inc: {
        'approvalStats.totalRequests': 1,
        [`approvalStats.${action}`]: 1
      }
    });

    // Send notification email to student
    await sendApprovalStatusEmail(
      request.studentId.email,
      request.studentId.profile.fullName,
      request.eventDetails.eventTitle,
      action,
      approvalLevel,
      req.teacher.profile.fullName,
      req.teacher.profile.designation,
      req.teacher.profile.department,
      remarks,
      request.overallStatus
    );

    res.json({
      success: true,
      message: `Request ${action} successfully`,
      request: {
        id: request._id,
        overallStatus: request.overallStatus,
        approvals: request.approvals,
        approvalHistory: request.approvalHistory
      }
    });
  } catch (error) {
    console.error('Review request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get teacher's approval history
router.get('/my-approvals', verifyTeacher, async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;

    // Build date filter
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter['approvalHistory.reviewedAt'] = {};
      if (startDate) dateFilter['approvalHistory.reviewedAt'].$gte = new Date(startDate);
      if (endDate) dateFilter['approvalHistory.reviewedAt'].$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const approvals = await DutyRequest.find({
      'approvalHistory.reviewedBy': req.teacher._id,
      ...dateFilter
    })
      .populate('studentId', 'profile.fullName email')
      .sort({ 'approvalHistory.reviewedAt': -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('studentInfo eventDetails approvalHistory overallStatus submittedAt');

    const totalCount = await DutyRequest.countDocuments({
      'approvalHistory.reviewedBy': req.teacher._id,
      ...dateFilter
    });

    res.json({
      success: true,
      approvals,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: skip + parseInt(limit) < totalCount,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get my approvals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update teacher profile
router.put('/profile', verifyTeacher, async (req, res) => {
  try {
    const { fullName, designation, department } = req.body;

    const updatedTeacher = await User.findByIdAndUpdate(
      req.teacher._id,
      {
        $set: {
          'profile.fullName': fullName,
          'profile.designation': designation,
          'profile.department': department
        }
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      teacher: updatedTeacher
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.post('/change-password', verifyTeacher, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isMatch = await req.teacher.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    req.teacher.password = newPassword;
    await req.teacher.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
