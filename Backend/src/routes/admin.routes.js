const express = require('express')
const authmiddleware = require('../middleware/auth.middleware')
const { adminMiddleware } = require('../middleware/auth.middleware')
const adminController = require('../controller/admin.controller')
const router = express.Router()

/**
 * All admin routes require authentication and admin role privileges
 */
router.get('/kyc-applications', authmiddleware, adminMiddleware, adminController.getKycApplications)
router.get('/stats', authmiddleware, adminMiddleware, adminController.getAdminStats)
router.get('/users', authmiddleware, adminMiddleware, adminController.getAllUsers)

module.exports = router
