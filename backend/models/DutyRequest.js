import mongoose from 'mongoose';

const dutyRequestSchema = new mongoose.Schema({
  // Student reference
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Core Student Info
  studentInfo: {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    registerNumber: {
      type: String,
      required: true,
      trim: true
    },
    department: {
      type: String,
      required: true,
      trim: true
    },
    year: {
      type: String,
      required: true,
      trim: true
    },
    section: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    }
  },

  // Event/Reason Details
  eventDetails: {
    reasonType: {
      type: String,
      required: true,
      enum: [
        'seminar', 'workshop', 'symposium', 'internship', 'hackathon', 
        'placement_drive', 'cultural', 'sports', 'medical', 
        'conference', 'competition', 'training', 'other'
      ]
    },
    eventTitle: {
      type: String,
      required: true,
      trim: true
    },
    eventTheme: {
      type: String,
      trim: true
    },
    venue: {
      institutionName: {
        type: String,
        required: true,
        trim: true
      },
      city: {
        type: String,
        required: true,
        trim: true
      },
      address: {
        type: String,
        trim: true
      }
    },
    dateRange: {
      startDate: {
        type: Date,
        required: true
      },
      endDate: {
        type: Date,
        required: true
      },
      startTime: {
        type: String,
        trim: true
      },
      endTime: {
        type: String,
        trim: true
      }
    },
    organizer: {
      name: {
        type: String,
        required: true,
        trim: true
      },
      type: {
        type: String,
        enum: ['college', 'company', 'club', 'organization'],
        required: true
      },
      contactInfo: {
        type: String,
        trim: true
      }
    }
  },

  // Academic Compliance
  academicDetails: {
    subjectsMissed: [{
      subjectName: {
        type: String,
        required: true,
        trim: true
      },
      facultyName: {
        type: String,
        required: true,
        trim: true
      },
      date: {
        type: Date,
        required: true
      },
      timeSlot: {
        type: String,
        required: true,
        trim: true
      },
      classType: {
        type: String,
        enum: ['lecture', 'lab', 'tutorial', 'practical'],
        required: true
      }
    }],
    undertaking: {
      type: String,
      required: true,
      default: "I undertake to compensate for all missed classes/labs and complete any assignments given during my absence."
    }
  },

  // Approval Chain
  approvals: {
    mentor: {
      teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      remarks: String,
      approvedAt: Date
    },
    hod: {
      teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      remarks: String,
      approvedAt: Date
    },
    principal: {
      teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      remarks: String,
      approvedAt: Date
    }
  },

  // Supporting Documents
  documents: {
    invitation: {
      type: String, // File path
      required: true
    },
    permissionLetter: {
      type: String // File path
    },
    travelProof: {
      type: String // File path
    },
    additionalDocs: [{
      fileName: String,
      filePath: String,
      description: String
    }]
  },

  // Administrative Fields
  applicationDate: {
    type: Date,
    default: Date.now
  },
  
  overallStatus: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'expired'],
    default: 'submitted'
  },

  studentSignature: {
    type: Boolean,
    default: false
  },

  // System fields
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

// Virtual for calculating total days
dutyRequestSchema.virtual('totalDays').get(function() {
  if (this.eventDetails.dateRange.startDate && this.eventDetails.dateRange.endDate) {
    const diffTime = Math.abs(this.eventDetails.dateRange.endDate - this.eventDetails.dateRange.startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
  return 0;
});

export default mongoose.model('DutyRequest', dutyRequestSchema);
