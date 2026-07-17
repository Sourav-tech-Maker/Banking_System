const express = require('express');
const rateLimit = require('express-rate-limit');
const authmiddleware = require("../middleware/auth.middleware");
const { dbReadLimiter } = require('../middleware/rateLimiter.middleware');
const goalsController = require('../controller/goals.controller');
const router = express.Router();

const goalsRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Too many requests for this operation, please try again after 15 minutes"
  }
});

/**
 * - POST /api/goals
 * - Create a new goal
 */
router.post('/', authmiddleware, goalsRateLimiter, goalsController.createGoal);

/**
 * - GET /api/goals
 * - Get all goals of the logged-in user
 */
router.get('/', authmiddleware, dbReadLimiter, goalsController.getGoals);

/**
 * - POST /api/goals/add-amount
 * - Add money to an existing goal
 */
router.post('/add-amount', authmiddleware, goalsRateLimiter, goalsController.addAmount);

/**
 * - GET /api/goals/history/:goalId
 * - Get history of added savings for a goal
 */
router.get('/history/:goalId', authmiddleware, dbReadLimiter, goalsController.getGoalHistory);

/**
 * - DELETE /api/goals/:goalId
 * - Delete a specific goal
 */
router.delete('/:goalId', authmiddleware, goalsRateLimiter, goalsController.deleteGoal);

module.exports = router;
