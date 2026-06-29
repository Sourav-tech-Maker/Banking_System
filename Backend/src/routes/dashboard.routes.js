const express = require('express')
const authmiddleware = require('../middleware/auth.middleware')
const dashboardController = require('../controller/dashboard.controller')
const router = express.Router()

/**
 * GET /api/dashboard/
 * Get aggregated dashboard data for the logged-in user
 * Protected Route
 */
router.get('/', authmiddleware, dashboardController.getDashboard)

module.exports = router
