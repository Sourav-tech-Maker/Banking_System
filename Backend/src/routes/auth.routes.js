const express = require('express');
const authController = require('../controller/auth.controller')
const router = express.Router();

//     Post /api/auth/register  
router.post('/register', authController.registerUser)
/**
 * GET /api/auth/refresh-token
 */
// router.get('/refresh-token', authController.refreshToken)

router.post('/login', authController.loginUser)
router.post('/logout', authController.logoutUser)

module.exports = router;
