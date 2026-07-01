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
router.put('/users/:userId/status', authmiddleware, adminMiddleware, adminController.updateUserStatus)
router.post('/users/:userId/reset-attempts', authmiddleware, adminMiddleware, adminController.resetUserLogins)
router.put('/accounts/:accountId/status', authmiddleware, adminMiddleware, adminController.updateAccountStatus)
router.get('/transactions', authmiddleware, adminMiddleware, adminController.getAllTransactions)
router.post('/transactions/:transactionId/reverse', authmiddleware, adminMiddleware, adminController.reverseTransaction)
router.delete('/kyc/:kycId', authmiddleware, adminMiddleware, adminController.deleteKycApplication)

module.exports = router
