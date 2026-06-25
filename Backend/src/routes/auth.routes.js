const express = require('express');
const authController = require('../controller/auth.controller')
const router = express.Router();

//     Post /api/auth/register  
router.post('/register', authController.registerUser)
router.post('/verify-otp', authController.verifyOtp)
router.post('/login', authController.loginUser)
router.post('/logout', authController.logoutUser)

module.exports = router;
