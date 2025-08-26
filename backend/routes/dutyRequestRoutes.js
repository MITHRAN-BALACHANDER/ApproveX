import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import DutyRequest from '../models/DutyRequest.js';
import User from '../models/User.js';
import { body, validationResult } from 'express-validator';
import { authenticateToken, requireStudent, requireTeacher } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, Word documents, and images are allowed'), false);
    }
  }
});

// Validation rules for duty request
const dutyRequestValidation = [
  body('requestData').custom((value, { req }) => {
    try {
      const data = typeof value === 'string' ? JSON.parse(value) : value;
      
      // Validate required fields
      if (!data.studentInfo?.fullName?.trim()) {
        throw new Error('Full name is required');
      }
      if (!data.studentInfo?.registerNumber?.trim()) {
        throw new Error('Register number is required');
      }
      if (!data.studentInfo?.department?.trim()) {
        throw new Error('Department is required');
      }
      if (!data.studentInfo?.year?.trim()) {
        throw new Error('Year is required');
      }
      if (!data.studentInfo?.section?.trim()) {
        throw new Error('Section is required');
      }
      if (!data.eventDetails?.eventTitle?.trim()) {
        throw new Error('Event title is required');
      }
      if (!data.eventDetails?.venue?.institutionName?.trim()) {
        throw new Error('Institution name is required');
      }
      if (!data.eventDetails?.venue?.city?.trim()) {
        throw new Error('City is required');
      }
      if (!data.eventDetails?.organizer?.name?.trim()) {
        throw new Error('Organizer name is required');
      }
      
      // Validate reason type
      const validReasonTypes = [
        'seminar', 'workshop', 'symposium', 'internship', 'hackathon', 
        'placement_drive', 'cultural', 'sports', 'medical', 
        'conference', 'competition', 'training', 'other'
      ];
      if (!validReasonTypes.includes(data.eventDetails?.reasonType)) {
        throw new Error('Invalid reason type');
      }
      
      // Validate dates
      const startDate = new Date(data.eventDetails?.dateRange?.startDate);
      const endDate = new Date(data.eventDetails?.dateRange?.endDate);
      if (isNaN(startDate.getTime())) {
        throw new Error('Valid start date is required');
      }
      if (isNaN(endDate.getTime())) {
        throw new Error('Valid end date is required');
      }
      
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  })
];

// Create uploads directory if it doesn't exist
import fs from 'fs';
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// GET all duty requests (Teachers can see all, Students see only theirs)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query = {};
    
    // Students can only see their own requests
    if (req.user.role === 'student') {
      query.studentId = req.user._id;
    }
    
    const dutyRequests = await DutyRequest.find(query)
      .populate('studentId', 'profile.fullName profile.registerNumber profile.department')
      .populate('approvals.mentor.teacherId', 'profile.fullName profile.designation')
      .populate('approvals.hod.teacherId', 'profile.fullName profile.designation')
      .populate('approvals.principal.teacherId', 'profile.fullName profile.designation')
      .sort({ submittedAt: -1 });
      
    res.json(dutyRequests);
  } catch (error) {
    console.error('Error fetching duty requests:', error);
    res.status(500).json({ message: 'Error fetching duty requests' });
  }
});

// GET duty request by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const dutyRequest = await DutyRequest.findById(req.params.id)
      .populate('studentId', 'profile.fullName profile.registerNumber profile.department')
      .populate('approvals.mentor.teacherId', 'profile.fullName profile.designation')
      .populate('approvals.hod.teacherId', 'profile.fullName profile.designation')
      .populate('approvals.principal.teacherId', 'profile.fullName profile.designation');
      
    if (!dutyRequest) {
      return res.status(404).json({ message: 'Duty request not found' });
    }

    // Students can only view their own requests
    if (req.user.role === 'student' && dutyRequest.studentId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(dutyRequest);
  } catch (error) {
    console.error('Error fetching duty request:', error);
    res.status(500).json({ message: 'Error fetching duty request' });
  }
});

// POST create new duty request (Students only)
router.post('/', 
  authenticateToken,
  requireStudent,
  upload.fields([
    { name: 'invitation', maxCount: 1 },
    { name: 'permissionLetter', maxCount: 1 },
    { name: 'travelProof', maxCount: 1 },
    { name: 'additionalDocs', maxCount: 5 }
  ]),
  dutyRequestValidation,
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({ 
          message: 'Validation failed', 
          errors: errors.array().map(err => err.msg)
        });
      }

      // Check for required files
      if (!req.files || !req.files.invitation) {
        console.log('Missing invitation file:', req.files);
        return res.status(400).json({ message: 'Invitation document is required' });
      }

      // Parse request data
      let requestData;
      try {
        requestData = JSON.parse(req.body.requestData);
      } catch (error) {
        console.log('Error parsing requestData:', error);
        return res.status(400).json({ message: 'Invalid request data format' });
      }

      console.log('Received duty request data:', {
        studentId: req.user._id,
        eventTitle: requestData.eventDetails?.eventTitle,
        files: Object.keys(req.files || {})
      });

      // Validate date range
      const startDate = new Date(requestData.eventDetails.dateRange.startDate);
      const endDate = new Date(requestData.eventDetails.dateRange.endDate);
      
      if (startDate > endDate) {
        return res.status(400).json({ message: 'Start date cannot be after end date' });
      }

      // Build documents object
      const documents = {
        invitation: req.files.invitation[0].filename
      };

      if (req.files.permissionLetter) {
        documents.permissionLetter = req.files.permissionLetter[0].filename;
      }

      if (req.files.travelProof) {
        documents.travelProof = req.files.travelProof[0].filename;
      }

      if (req.files.additionalDocs) {
        documents.additionalDocs = req.files.additionalDocs.map(file => ({
          fileName: file.originalname,
          filePath: file.filename,
          description: req.body.docDescriptions || 'Additional document'
        }));
      }

      const dutyRequest = new DutyRequest({
        studentId: req.user._id,
        studentInfo: {
          ...requestData.studentInfo,
          email: req.user.email
        },
        eventDetails: requestData.eventDetails,
        academicDetails: requestData.academicDetails,
        documents: documents,
        studentSignature: true
      });

      const savedRequest = await dutyRequest.save();
      
      // Populate the response
      const populatedRequest = await DutyRequest.findById(savedRequest._id)
        .populate('studentId', 'profile.fullName profile.registerNumber profile.department');

      res.status(201).json({
        message: 'Duty request submitted successfully',
        request: populatedRequest
      });
    } catch (error) {
      console.error('Error creating duty request:', error);
      res.status(500).json({ message: 'Error creating duty request' });
    }
  }
);

// PUT update approval status (Teachers only)
router.put('/:id/approve', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const { approvalLevel, status, remarks } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    if (!['mentor', 'hod', 'principal'].includes(approvalLevel)) {
      return res.status(400).json({ message: 'Invalid approval level' });
    }

    const dutyRequest = await DutyRequest.findById(req.params.id);
    if (!dutyRequest) {
      return res.status(404).json({ message: 'Duty request not found' });
    }

    // Update the specific approval level
    dutyRequest.approvals[approvalLevel] = {
      teacherId: req.user._id,
      status: status,
      remarks: remarks || '',
      approvedAt: new Date()
    };

    // Update overall status based on approval chain
    if (status === 'rejected') {
      dutyRequest.overallStatus = 'rejected';
    } else {
      // Check if all required approvals are complete
      const mentorApproved = dutyRequest.approvals.mentor.status === 'approved';
      const hodApproved = dutyRequest.approvals.hod.status === 'approved';
      const principalApproved = dutyRequest.approvals.principal.status === 'approved';

      if (mentorApproved && hodApproved && principalApproved) {
        dutyRequest.overallStatus = 'approved';
      } else {
        dutyRequest.overallStatus = 'under_review';
      }
    }

    await dutyRequest.save();

    const updatedRequest = await DutyRequest.findById(dutyRequest._id)
      .populate('studentId', 'profile.fullName profile.registerNumber')
      .populate('approvals.mentor.teacherId', 'profile.fullName profile.designation')
      .populate('approvals.hod.teacherId', 'profile.fullName profile.designation')
      .populate('approvals.principal.teacherId', 'profile.fullName profile.designation');

    res.json({
      message: `Request ${status} successfully`,
      request: updatedRequest
    });
  } catch (error) {
    console.error('Error updating approval:', error);
    res.status(500).json({ message: 'Error updating approval' });
  }
});

// GET requests for approval (Teachers only)
router.get('/pending/approvals', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const { level } = req.query; // mentor, hod, principal
    
    let query = {
      overallStatus: { $in: ['submitted', 'under_review'] }
    };

    // Filter based on approval level
    if (level === 'mentor') {
      query['approvals.mentor.status'] = 'pending';
    } else if (level === 'hod') {
      query['approvals.mentor.status'] = 'approved';
      query['approvals.hod.status'] = 'pending';
    } else if (level === 'principal') {
      query['approvals.mentor.status'] = 'approved';
      query['approvals.hod.status'] = 'approved';
      query['approvals.principal.status'] = 'pending';
    }

    const pendingRequests = await DutyRequest.find(query)
      .populate('studentId', 'profile.fullName profile.registerNumber profile.department profile.year profile.section')
      .sort({ submittedAt: 1 });

    res.json(pendingRequests);
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ message: 'Error fetching pending requests' });
  }
});

// DELETE duty request (Students can delete their own drafts, Admins can delete any)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const dutyRequest = await DutyRequest.findById(req.params.id);
    
    if (!dutyRequest) {
      return res.status(404).json({ message: 'Duty request not found' });
    }

    // Students can only delete their own requests that are still in draft/submitted status
    if (req.user.role === 'student') {
      if (dutyRequest.studentId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
      if (!['draft', 'submitted'].includes(dutyRequest.overallStatus)) {
        return res.status(400).json({ message: 'Cannot delete request that is under review or approved' });
      }
    }

    await DutyRequest.findByIdAndDelete(req.params.id);

    res.json({ message: 'Duty request deleted successfully' });
  } catch (error) {
    console.error('Error deleting duty request:', error);
    res.status(500).json({ message: 'Error deleting duty request' });
  }
});

export default router;
