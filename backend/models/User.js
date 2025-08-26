import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    required: true
  },
  profile: {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    // Student-specific fields
    registerNumber: {
      type: String,
      sparse: true, // Only for students
      trim: true
    },
    department: {
      type: String,
      trim: true
    },
    year: {
      type: String,
      trim: true
    },
    section: {
      type: String,
      trim: true
    },
    // Teacher-specific fields
    employeeId: {
      type: String,
      sparse: true, // Only for teachers
      trim: true
    },
    designation: {
      type: String,
      trim: true
    },
    // Admin-specific fields
    adminLevel: {
      type: String,
      enum: ['super_admin', 'admin'],
      default: 'admin'
    },
    // Teacher management fields
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false // Optional for manually created teachers
    },
    approvalStats: {
      totalRequests: { type: Number, default: 0 },
      approved: { type: Number, default: 0 },
      rejected: { type: Number, default: 0 },
      pending: { type: Number, default: 0 }
    },
    isApprover: {
      type: Boolean,
      default: function() { return this.role === 'teacher'; }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Email verification fields
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    sparse: true
  },
  emailVerificationExpires: {
    type: Date
  },
  // Password change OTP fields
  passwordChangeOTP: {
    type: String,
    sparse: true
  },
  passwordChangeOTPExpiry: {
    type: Date
  },
  // College email fields - optional for teachers using external emails
  collegeEmail: {
    type: String,
    required: function() { return this.role === 'student'; }, // Only required for students
    unique: function() { return this.role === 'student' && this.collegeEmail; }, // Only unique for students
    sparse: true, // Allow multiple documents without this field
    trim: true,
    lowercase: true
  },
  rollNumber: {
    type: String,
    required: function() { return this.role === 'student'; },
    trim: true,
    uppercase: true
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcryptjs.genSalt(12);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcryptjs.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
