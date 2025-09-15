import express from 'express';
import multer from 'multer';
import path from 'path';
import { body, validationResult } from 'express-validator';
import LeaveRequest from '../models/LeaveRequest.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/leave-documents/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'leave-doc-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDF, and document files are allowed!'));
    }
  }
});

// Input validation for leave request
const leaveRequestValidation = [
  body('leaveType')
    .isIn(['sick', 'personal', 'family', 'medical', 'emergency', 'other'])
    .withMessage('Valid leave type is required'),
  body('reason')
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters'),
  body('startDate')
    .isISO8601()
    .toDate()
    .withMessage('Valid start date is required'),
  body('endDate')
    .isISO8601()
    .toDate()
    .withMessage('Valid end date is required')
    .custom((endDate, { req }) => {
      if (new Date(endDate) < new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
];

// GET /api/leave-requests - Get all leave requests (filtered by role)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'student') {
      query.studentId = req.user._id;
    } else if (req.user.role === 'teacher') {
      // Teachers can see requests that need their approval
      query.$or = [
        { 'classTeacherApproval.status': 'pending' },
        { 'hodApproval.status': 'pending' }
      ];
    }

    const leaveRequests = await LeaveRequest.find(query)
      .populate('studentId', 'email profile')
      .sort({ createdAt: -1 });

    res.json({ 
      success: true,
      leaveRequests 
    });
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching leave requests' 
    });
  }
});

// GET /api/leave-requests/:id - Get leave request by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id)
      .populate('studentId', 'email profile')
      .populate('classTeacherApproval.teacherId', 'email profile')
      .populate('hodApproval.teacherId', 'email profile');

    if (!leaveRequest) {
      return res.status(404).json({ 
        success: false,
        message: 'Leave request not found' 
      });
    }

    // Check access permissions
    if (req.user.role === 'student' && leaveRequest.studentId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied' 
      });
    }

    res.json({ 
      success: true,
      leaveRequest 
    });
  } catch (error) {
    console.error('Error fetching leave request:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching leave request' 
    });
  }
});

// POST /api/leave-requests - Create new leave request (students only)
router.post('/', authenticateToken, upload.array('documents', 3), leaveRequestValidation, async (req, res) => {
  try {
    // Check if user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({ 
        success: false,
        message: 'Only students can submit leave requests' 
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const {
      leaveType,
      reason,
      startDate,
      endDate,
      isEmergency,
      emergencyContact
    } = req.body;

    // Get current academic year
    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear}-${currentYear + 1}`;

    // Process uploaded documents
    const documents = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    })) : [];

    // Create leave request
    const leaveRequest = new LeaveRequest({
      studentId: req.user._id,
      studentInfo: {
        fullName: req.user.profile.fullName,
        registerNumber: req.user.profile.registerNumber,
        department: req.user.profile.department,
        year: req.user.profile.year,
        section: req.user.profile.section,
        email: req.user.email
      },
      leaveType,
      reason,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isEmergency: isEmergency === 'true',
      emergencyContact: emergencyContact ? JSON.parse(emergencyContact) : null,
      documents,
      academicYear
    });

    await leaveRequest.save();

    res.status(201).json({ 
      success: true,
      message: 'Leave request submitted successfully',
      leaveRequest 
    });
  } catch (error) {
    console.error('Error creating leave request:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error submitting leave request' 
    });
  }
});

// PUT /api/leave-requests/:id/approve - Update approval status (teachers only)
router.put('/:id/approve', authenticateToken, [
  body('approvalType')
    .isIn(['classTeacher', 'hod'])
    .withMessage('Valid approval type is required'),
  body('status')
    .isIn(['approved', 'rejected'])
    .withMessage('Valid status is required'),
  body('remarks')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Remarks must not exceed 200 characters')
], async (req, res) => {
  try {
    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ 
        success: false,
        message: 'Only teachers can approve leave requests' 
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { approvalType, status, remarks } = req.body;
    const leaveRequest = await LeaveRequest.findById(req.params.id);

    if (!leaveRequest) {
      return res.status(404).json({ 
        success: false,
        message: 'Leave request not found' 
      });
    }

    // Update approval based on type
    const approvalData = {
      teacherId: req.user._id,
      teacherName: req.user.profile.fullName,
      status,
      remarks,
      approvedAt: new Date()
    };

    if (approvalType === 'classTeacher') {
      leaveRequest.classTeacherApproval = approvalData;
    } else if (approvalType === 'hod') {
      leaveRequest.hodApproval = approvalData;
    }

    // Update overall status
    if (leaveRequest.requiresHODApproval) {
      if (leaveRequest.classTeacherApproval.status === 'rejected' || leaveRequest.hodApproval.status === 'rejected') {
        leaveRequest.status = 'rejected';
      } else if (leaveRequest.classTeacherApproval.status === 'approved' && leaveRequest.hodApproval.status === 'approved') {
        leaveRequest.status = 'approved';
      } else {
        leaveRequest.status = 'pending';
      }
    } else {
      leaveRequest.status = leaveRequest.classTeacherApproval.status;
    }

    await leaveRequest.save();

    res.json({ 
      success: true,
      message: `Leave request ${status} successfully`,
      leaveRequest 
    });
  } catch (error) {
    console.error('Error updating leave request approval:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating leave request approval' 
    });
  }
});

// GET /api/leave-requests/pending/approvals - Get pending approvals for teachers
router.get('/pending/approvals', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied' 
      });
    }

    const { level } = req.query; // 'classTeacher' or 'hod'
    
    let query = {};
    if (level === 'classTeacher') {
      query['classTeacherApproval.status'] = 'pending';
    } else if (level === 'hod') {
      query['hodApproval.status'] = 'pending';
      query['classTeacherApproval.status'] = 'approved'; // HOD can only approve after class teacher
    }

    const pendingRequests = await LeaveRequest.find(query)
      .populate('studentId', 'email profile')
      .sort({ createdAt: -1 });

    res.json({ 
      success: true,
      pendingRequests 
    });
  } catch (error) {
    console.error('Error fetching pending leave approvals:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching pending leave approvals' 
    });
  }
});

// DELETE /api/leave-requests/:id - Delete leave request (students only, if pending)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id);

    if (!leaveRequest) {
      return res.status(404).json({ 
        success: false,
        message: 'Leave request not found' 
      });
    }

    // Check permissions
    if (req.user.role !== 'student' || leaveRequest.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied' 
      });
    }

    // Can only delete pending requests
    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot delete approved or rejected requests' 
      });
    }

    await LeaveRequest.findByIdAndDelete(req.params.id);

    res.json({ 
      success: true,
      message: 'Leave request deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting leave request:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting leave request' 
    });
  }
});

export default router;
