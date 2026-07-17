const express = require('express')
const authmiddleware = require('../middleware/auth.middleware')
const { adminMiddleware } = require('../middleware/auth.middleware')
const { dbReadLimiter, dbWriteLimiter, transactionLimiter } = require('../middleware/rateLimiter.middleware')
const adminController = require('../controller/admin.controller')
const router = express.Router()

/**
 * All admin routes require authentication and admin role privileges
 */
router.get('/kyc-applications', authmiddleware, adminMiddleware, dbReadLimiter, adminController.getKycApplications)
router.get('/stats', authmiddleware, adminMiddleware, dbReadLimiter, adminController.getAdminStats)
router.get('/users', authmiddleware, adminMiddleware, dbReadLimiter, adminController.getAllUsers)
router.put('/users/:userId/status', authmiddleware, adminMiddleware, dbWriteLimiter, adminController.updateUserStatus)
router.post('/users/:userId/reset-attempts', authmiddleware, adminMiddleware, dbWriteLimiter, adminController.resetUserLogins)
router.put('/accounts/:accountId/status', authmiddleware, adminMiddleware, dbWriteLimiter, adminController.updateAccountStatus)
router.get('/transactions', authmiddleware, adminMiddleware, dbReadLimiter, adminController.getAllTransactions)
router.post('/transactions/:transactionId/reverse', authmiddleware, adminMiddleware, transactionLimiter, adminController.reverseTransaction)
router.delete('/kyc/:kycId', authmiddleware, adminMiddleware, dbWriteLimiter, adminController.deleteKycApplication)

module.exports = router
