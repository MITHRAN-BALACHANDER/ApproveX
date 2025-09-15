import mongoose from 'mongoose';
import DutyRequest from './models/DutyRequest.js';
import dotenv from 'dotenv';

dotenv.config();

const migrateDutyRequests = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Find all existing duty requests
    const requests = await DutyRequest.find({});
    console.log(`📊 Found ${requests.length} duty requests to migrate`);

    let migratedCount = 0;

    for (const request of requests) {
      let needsUpdate = false;
      const updateData = {};

      // Migrate from old approvals structure to new single approval structure
      if (request.approvals) {
        // Check if any approval level has been reviewed
        let reviewedApproval = null;
        
        if (request.approvals.mentor && request.approvals.mentor.status !== 'pending') {
          reviewedApproval = request.approvals.mentor;
        } else if (request.approvals.hod && request.approvals.hod.status !== 'pending') {
          reviewedApproval = request.approvals.hod;
        } else if (request.approvals.principal && request.approvals.principal.status !== 'pending') {
          reviewedApproval = request.approvals.principal;
        }

        if (reviewedApproval) {
          // Create new single approval structure
          updateData.approval = {
            teacherId: reviewedApproval.teacherId,
            teacherName: reviewedApproval.reviewedBy || 'Unknown Teacher',
            teacherDesignation: reviewedApproval.reviewerDesignation || 'Staff',
            teacherDepartment: reviewedApproval.reviewerDepartment || 'N/A',
            status: reviewedApproval.status,
            remarks: reviewedApproval.remarks || '',
            approvedAt: reviewedApproval.approvedAt || new Date()
          };
          
          // Update approval history if it doesn't exist
          if (!request.approvalHistory || request.approvalHistory.length === 0) {
            updateData.approvalHistory = [{
              reviewedBy: reviewedApproval.teacherId,
              reviewerName: reviewedApproval.reviewedBy || 'Unknown Teacher',
              reviewerDesignation: reviewedApproval.reviewerDesignation || 'Staff',
              reviewerDepartment: reviewedApproval.reviewerDepartment || 'N/A',
              action: reviewedApproval.status,
              remarks: reviewedApproval.remarks || '',
              reviewedAt: reviewedApproval.approvedAt || new Date()
            }];
          }
        } else {
          // No approvals yet, set pending approval
          updateData.approval = {
            status: 'pending'
          };
        }

        // Remove old approvals structure
        updateData.$unset = { approvals: 1 };
        needsUpdate = true;
      }

      // Apply updates if needed
      if (needsUpdate) {
        await DutyRequest.findByIdAndUpdate(request._id, updateData);
        migratedCount++;
        console.log(`✅ Migrated request ${request._id}`);
      }
    }

    console.log(`\n🎉 Migration completed!`);
    console.log(`📈 Total requests migrated: ${migratedCount}`);
    console.log(`📊 Total requests processed: ${requests.length}`);

  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📡 Database connection closed');
    process.exit(0);
  }
};

// Run migration
migrateDutyRequests().catch(console.error);
