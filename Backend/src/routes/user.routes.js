const express = require('express')
const authmiddleware = require('../middleware/auth.middleware')
const userController = require('../controller/user.controller')
const router = express.Router()

/**
 * GET /api/user/profile
 * Get user profile with KYC status and account info
 * Protected Route
 */
router.get('/profile', authmiddleware, userController.getProfile)

module.exports = router
