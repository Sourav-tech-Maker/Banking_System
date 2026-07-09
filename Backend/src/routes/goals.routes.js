const express = require('express');
const authmiddleware = require("../middleware/auth.middleware");
const goalsController = require('../controller/goals.controller');
const router = express.Router();

/**
 * - POST /api/goals
 * - Create a new goal
 */
router.post('/', authmiddleware, goalsController.createGoal);

/**
 * - GET /api/goals
 * - Get all goals of the logged-in user
 */
router.get('/', authmiddleware, goalsController.getGoals);

/**
 * - POST /api/goals/add-amount
 * - Add money to an existing goal
 */
router.post('/add-amount', authmiddleware, goalsController.addAmount);

/**
 * - GET /api/goals/history/:goalId
 * - Get history of added savings for a goal
 */
router.get('/history/:goalId', authmiddleware, goalsController.getGoalHistory);

/**
 * - DELETE /api/goals/:goalId
 * - Delete a specific goal
 */
router.delete('/:goalId', authmiddleware, goalsController.deleteGoal);

module.exports = router;
