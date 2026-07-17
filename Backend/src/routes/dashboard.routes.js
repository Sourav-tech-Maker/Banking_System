const express = require('express')
const authmiddleware = require('../middleware/auth.middleware')
const { dbReadLimiter } = require('../middleware/rateLimiter.middleware')
const dashboardController = require('../controller/dashboard.controller')
const router = express.Router()

/**
 * GET /api/dashboard/
 * Get aggregated dashboard data for the logged-in user
 * Protected Route
 */
router.get('/', authmiddleware, dbReadLimiter, dashboardController.getDashboard)

module.exports = router
