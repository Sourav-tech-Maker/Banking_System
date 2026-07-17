const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controller/auth.controller')
const { authmiddleware } = require('../middleware/auth.middleware');
const router = express.Router();

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

//     Post /api/auth/register  
router.post('/register', authRateLimiter, authController.registerUser)
router.post('/verify-otp', authRateLimiter, authController.verifyOtp)
router.post('/login', authRateLimiter, authController.loginUser)

router.post('/refresh-token', authRateLimiter, authController.refreshAccessToken);

router.post('/logout', authRateLimiter, authController.logoutUser)
module.exports = router;
