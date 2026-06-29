const dashboardService = require('../services/dashboard.service')

/**
 * GET /api/dashboard/
 * Returns aggregated dashboard data for the logged-in user
 */
async function getDashboard(req, res, next) {
    try {
        const user = req.user
        const dashboardData = await dashboardService.getDashboardData(user)

        return res.status(200).json(dashboardData)
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getDashboard
}
