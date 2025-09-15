// 

import mongoose from 'mongoose';

const leaveRequestSchema = new mongoose.Schema({
  // Student Information
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentInfo: {
    fullName: { type: String, required: true },
    registerNumber: { type: String, required: true },
    department: { type: String, required: true },
    year: { type: String, required: true },
    section: { type: String, required: true },
    email: { type: String, required: true }
  },

  // Leave Details
  leaveType: {
    type: String,
    enum: ['sick', 'personal', 'family', 'medical', 'emergency', 'other'],
    required: true
  },
  reason: {
    type: String,
    required: true,
    maxlength: 500
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalDays: {
    type: Number,
    required: true
  },
  
  // Emergency Contact (for longer leaves)
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },

  // Supporting Documents
  documents: [{
    filename: String,
    originalname: String,
    mimetype: String,
    size: Number,
    uploadDate: { type: Date, default: Date.now }
  }],

  // Approval Process
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  
  // Class Teacher/HOD Approval
  classTeacherApproval: {
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    teacherName: String,
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'], 
      default: 'pending' 
    },
    remarks: String,
    approvedAt: Date
  },

  // HOD Approval (for leaves > 3 days)
  hodApproval: {
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    teacherName: String,
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'], 
      default: 'pending' 
    },
    remarks: String,
    approvedAt: Date
  },

  // Additional Information
  isEmergency: {
    type: Boolean,
    default: false
  },
  
  academicYear: {
    type: String,
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
leaveRequestSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// ✅ Calculate totalDays before validation (fixes the required error)
leaveRequestSchema.pre('validate', function(next) {
  if (this.startDate && this.endDate) {
    const timeDifference = this.endDate.getTime() - this.startDate.getTime();
    this.totalDays = Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1;
  }
  next();
});

// Virtual for checking if HOD approval is required
leaveRequestSchema.virtual('requiresHODApproval').get(function() {
  return this.totalDays > 3;
});

// Virtual for overall status
leaveRequestSchema.virtual('overallStatus').get(function() {
  if (this.requiresHODApproval) {
    if (this.classTeacherApproval.status === 'rejected' || this.hodApproval.status === 'rejected') {
      return 'rejected';
    }
    if (this.classTeacherApproval.status === 'approved' && this.hodApproval.status === 'approved') {
      return 'approved';
    }
    return 'pending';
  } else {
    return this.classTeacherApproval.status;
  }
});

// Ensure virtual fields are serialized
leaveRequestSchema.set('toJSON', { virtuals: true });
leaveRequestSchema.set('toObject', { virtuals: true });

const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);

export default LeaveRequest;
