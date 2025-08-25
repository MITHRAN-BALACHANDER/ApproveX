import mongoose from 'mongoose';

const dutyRequestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  studentId: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  issueType: {
    type: String,
    required: true,
    enum: ['event', 'exam', 'medical', 'official', 'other']
  },
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  eventPdf: {
    type: String, // File path
    required: true
  },
  eventCertificate: {
    type: String, // File path
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved', 'rejected'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

dutyRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('DutyRequest', dutyRequestSchema);
