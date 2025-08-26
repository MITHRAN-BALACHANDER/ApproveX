import express from 'express';
import { sendVerificationEmail } from '../utils/emailService.js';

const router = express.Router();

// Test email endpoint
router.post('/test-email', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({ 
        message: 'Email and name are required for testing' 
      });
    }

    const testToken = 'test_verification_token_123456';
    
    const result = await sendVerificationEmail(email, testToken, name);
    
    if (result.success) {
      res.json({ 
        message: 'Test email sent successfully!',
        details: 'Check your email inbox for the verification message.'
      });
    } else {
      res.status(500).json({ 
        message: 'Failed to send test email',
        error: result.error 
      });
    }
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ 
      message: 'Error sending test email',
      error: error.message 
    });
  }
});

export default router;
