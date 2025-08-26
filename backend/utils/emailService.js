import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Generate verification token
export const generateVerificationToken = () => {
  // Generate a 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
export const sendVerificationEmail = async (email, token, name) => {
  const transporter = createTransporter();
  
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: 'Verify Your Email - OD Provider System',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Email Verification</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${name}!</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Welcome to the OD Provider System! Please use the verification code below to complete your registration.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #333; font-size: 18px; margin-bottom: 15px; font-weight: bold;">Your Verification Code:</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border: 2px dashed #667eea; margin: 20px 0;">
              <span id="otpCode" style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace; cursor: pointer; user-select: all;" 
                    onclick="navigator.clipboard.writeText('${token}').then(() => alert('OTP copied to clipboard!')).catch(() => prompt('Copy this OTP:', '${token}'))"
                    title="Click to copy OTP">
                ${token}
              </span>
            </div>
           
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <p style="color: #666; font-size: 14px; margin-bottom: 15px;">Or click the button below to verify automatically:</p>
            <a href="${verificationUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      text-decoration: none; 
                      padding: 12px 25px; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      font-size: 14px;
                      display: inline-block;
                      transition: transform 0.2s;">
              Verify Email Address
            </a>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <p style="color: #666; margin: 0; font-size: 14px;">
              <strong>Security Note:</strong> This verification code will expire in 1 hour for your security. Do not share this code with anyone.
            </p>
          </div>
          
          <div style="background: #e8f4f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #2c5aa0; margin: 0; font-size: 14px; text-align: center;">
              <strong>📱 Quick Steps:</strong><br>
              1. Copy the 6-digit code above<br>
              2. Go to the registration page<br>
              3. Paste the code and set your password
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            If you didn't create this account, please ignore this email. If you have any questions, contact your system administrator.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
            © ${new Date().getFullYear()} OD Provider System. All rights reserved.
          </p>
        </div>
      </div>
      
      <script>
        // Add click-to-copy functionality for better compatibility
        function copyOTP() {
          const otp = '${token}';
          if (navigator.clipboard) {
            navigator.clipboard.writeText(otp).then(() => {
              alert('OTP copied to clipboard!');
            }).catch(() => {
              // Fallback for older browsers
              prompt('Copy this OTP:', otp);
            });
          } else {
            // Fallback for browsers without clipboard API
            prompt('Copy this OTP:', otp);
          }
        }
      </script>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email} with OTP: ${token}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
    return { success: false, error: error.message };
  }
};

// Parse college email to extract student information
export const parseCollegeEmail = (email) => {
  try {
    // Extract the local part before @
    const localPart = email.split('@')[0];
    const domain = email.split('@')[1];
    
    // Check if it's a valid college domain
    if (domain !== process.env.COLLEGE_DOMAIN) {
      throw new Error('Invalid college domain');
    }
    
    // Parse pattern: name + year + department + @srishakthi.ac.in
    // Example: mithrans23it@srishakthi.ac.in
    const regex = /^([a-zA-Z]+)(\d{2})([a-zA-Z]+)$/;
    const match = localPart.match(regex);
    
    if (!match) {
      throw new Error('Invalid email format. Expected format: name+year+dept@srishakthi.ac.in');
    }
    
    const [, name, yearDigits, department] = match;
    
    // Convert 2-digit year to full academic year
    const currentYear = new Date().getFullYear();
    const currentYearDigits = currentYear % 100;
    
    let academicYear;
    if (parseInt(yearDigits) <= currentYearDigits + 4) {
      academicYear = `20${yearDigits}`;
    } else {
      academicYear = `19${yearDigits}`;
    }
    
    // Determine current year of study
    const admissionYear = parseInt(academicYear);
    const studyYear = currentYear - admissionYear + 1;
    
    // Map department codes to full names
    const departmentMap = {
      'cse': 'Computer Science and Engineering',
      'it': 'Information Technology',
      'ece': 'Electronics and Communication Engineering',
      'eee': 'Electrical and Electronics Engineering',
      'mech': 'Mechanical Engineering',
      'civil': 'Civil Engineering',
      'che': 'Chemical Engineering',
      'bio': 'Biotechnology',
      'bme': 'Biomedical Engineering'
    };
    
    const fullDepartment = departmentMap[department.toLowerCase()] || department.toUpperCase();
    
    return {
      success: true,
      data: {
        name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
        year: studyYear > 0 && studyYear <= 4 ? studyYear.toString() : '1',
        department: fullDepartment,
        rollNumber: localPart.toUpperCase(),
        admissionYear: academicYear
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, token, name) => {
  const transporter = createTransporter();
  
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request - OD Provider System',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${name}!</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            We received a request to reset your password for the OD Provider System. Click the button below to create a new password.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); 
                      color: white; 
                      text-decoration: none; 
                      padding: 15px 30px; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      font-size: 16px;
                      display: inline-block;
                      transition: transform 0.2s;">
              Reset Password
            </a>
          </div>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ffc107;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>Security Note:</strong> This reset link will expire in 1 hour. If you didn't request this reset, please ignore this email.
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
            © ${new Date().getFullYear()} OD Provider System. All rights reserved.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    return { success: false, error: error.message };
  }
};

// Send teacher invite email
export const sendTeacherInviteEmail = async (email, tempPassword, name, designation) => {
  const transporter = createTransporter();
  
  const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/teacher/login`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: 'Teacher Account Created - OD Provider System',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to OD Provider System</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${name}!</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Your teacher account has been created for the OD Provider System. You can now manage and approve student OD requests.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="color: #333; margin-bottom: 15px;">Login Credentials:</h3>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Designation:</strong> ${designation}</p>
            <p style="margin: 5px 0;"><strong>Temporary Password:</strong> 
              <span style="background: #e3f2fd; padding: 5px 10px; border-radius: 4px; font-family: monospace; color: #1976d2;">
                ${tempPassword}
              </span>
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" 
               style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); 
                      color: white; 
                      text-decoration: none; 
                      padding: 15px 30px; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      font-size: 16px;
                      display: inline-block;">
              Login to Dashboard
            </a>
          </div>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ffc107;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>Security Note:</strong> Please change your password after first login for security purposes.
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
            © ${new Date().getFullYear()} OD Provider System. All rights reserved.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Teacher invite email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send teacher invite email:', error);
    return { success: false, error: error.message };
  }
};

// Send approval status email to student
export const sendApprovalStatusEmail = async (email, studentName, eventTitle, action, approvalLevel, teacherName, teacherDesignation, teacherDepartment, remarks, overallStatus) => {
  const transporter = createTransporter();
  
  const statusColor = action === 'approved' ? '#4CAF50' : '#f44336';
  const statusIcon = action === 'approved' ? '✅' : '❌';
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: `OD Request ${action.toUpperCase()} - ${eventTitle}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, ${statusColor} 0%, ${statusColor}dd 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">${statusIcon} OD Request ${action.toUpperCase()}</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${studentName}!</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Your OD request for <strong>"${eventTitle}"</strong> has been <strong>${action}</strong> by the ${approvalLevel.toUpperCase()}.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="color: #333; margin-bottom: 15px;">Review Details:</h3>
            <p style="margin: 5px 0;"><strong>Reviewed by:</strong> ${teacherName}</p>
            <p style="margin: 5px 0;"><strong>Designation:</strong> ${teacherDesignation}</p>
            <p style="margin: 5px 0;"><strong>Department:</strong> ${teacherDepartment}</p>
            <p style="margin: 5px 0;"><strong>Review Level:</strong> ${approvalLevel.toUpperCase()}</p>
            <p style="margin: 5px 0;"><strong>Action:</strong> 
              <span style="color: ${statusColor}; font-weight: bold;">${action.toUpperCase()}</span>
            </p>
            <p style="margin: 5px 0;"><strong>Overall Status:</strong> 
              <span style="color: #666; font-weight: bold;">${overallStatus.replace('_', ' ').toUpperCase()}</span>
            </p>
            ${remarks ? `<p style="margin: 5px 0;"><strong>Remarks:</strong> ${remarks}</p>` : ''}
          </div>
          
          ${overallStatus === 'approved' ? `
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #4CAF50;">
              <p style="color: #2e7d32; margin: 0; font-size: 14px;">
                <strong>🎉 Congratulations!</strong> Your OD request has been fully approved. You can now attend the event.
              </p>
            </div>
          ` : overallStatus === 'rejected' ? `
            <div style="background: #ffebee; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f44336;">
              <p style="color: #c62828; margin: 0; font-size: 14px;">
                <strong>❌ Request Rejected:</strong> Your OD request has been rejected. Please contact your teacher for more information.
              </p>
            </div>
          ` : `
            <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ff9800;">
              <p style="color: #e65100; margin: 0; font-size: 14px;">
                <strong>⏳ Under Review:</strong> Your request is still being reviewed by other authorities. You will be notified of the final decision.
              </p>
            </div>
          `}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/student/requests" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      text-decoration: none; 
                      padding: 12px 25px; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      font-size: 14px;
                      display: inline-block;">
              View Request Status
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
            © ${new Date().getFullYear()} OD Provider System. All rights reserved.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Approval status email sent to ${email} - ${action}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send approval status email:', error);
    return { success: false, error: error.message };
  }
};

// Send password change OTP email
export const sendPasswordChangeOTPEmail = async (email, otp, name) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: 'Password Change OTP - OD Provider System',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Password Change Request</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${name}!</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            You have requested to change your password for the OD Provider System. Please use the OTP below to complete the password change process.
          </p>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="color: #856404; margin: 0; font-weight: bold;">
              ⚠️ Security Notice: If you didn't request this password change, please ignore this email or contact support immediately.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #333; font-size: 18px; margin-bottom: 15px; font-weight: bold;">Your OTP Code:</p>
            <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; border: 3px solid #ff6b6b; margin: 20px 0;">
              <span style="font-size: 42px; font-weight: bold; color: #ff6b6b; letter-spacing: 10px; font-family: 'Courier New', monospace; user-select: all;">
                ${otp}
              </span>
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 15px;">
              This OTP will expire in <strong>10 minutes</strong>
            </p>
          </div>
          
          <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 25px 0;">
            <h4 style="color: #1976d2; margin: 0 0 10px 0;">📋 How to use this OTP:</h4>
            <ol style="color: #666; margin: 0; padding-left: 20px;">
              <li>Go to the password change page</li>
              <li>Enter this OTP code</li>
              <li>Set your new password</li>
              <li>Confirm the change</li>
            </ol>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #666; font-size: 14px;">
              This OTP was requested on ${new Date().toLocaleString()}
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
            © ${new Date().getFullYear()} OD Provider System. All rights reserved.<br>
            This is an automated email. Please do not reply to this email.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Password change OTP email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send password change OTP email:', error);
    return { success: false, error: error.message };
  }
};
