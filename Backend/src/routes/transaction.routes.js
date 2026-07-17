const express = require('express')
const authMiddleware = require('../middleware/auth.middleware')
const transactionController = require('../controller/transcation.controller')
const authmiddleware = require('../middleware/auth.middleware')
const { dbReadLimiter, transactionLimiter } = require('../middleware/rateLimiter.middleware')
const transactionRoutes = express.Router()

/**
 * Post /api/transaction/
 * Create a new transaction
 * Protected Route - requires fromAccount, toAccount, amount, idempotencyKey in the request body
 */
transactionRoutes.post('/', authMiddleware, transactionLimiter, transactionController.createTransaction)

/**
 * Post /api/transaction/system/initial-funds
 * Create a new transaction for initial funds allocation to a new account
 * Protected Route - Only accessible by system users
 */
transactionRoutes.post('/system/initial-funds', authmiddleware.authSystemUserMiddleware, transactionLimiter, transactionController.createInitialFundsTransaction)

/**
 * GET /api/transaction/history
 * Get paginated transaction history for the logged-in user
 * Protected Route - supports query params: page, limit, type (all/credit/debit), startDate, endDate
 */
transactionRoutes.get('/history', authMiddleware, dbReadLimiter, transactionController.getTransactionHistory)

module.exports = transactionRoutes
