const express = require('express')
const authmiddleware = require("../middleware/auth.middleware")
const { dbReadLimiter, dbWriteLimiter } = require('../middleware/rateLimiter.middleware')
const accountController = require('../controller/account.controller')
const router = express.Router()

/**
 * - POST /api/account/
 * - create a new account 
 */ 
router.post('/', authmiddleware, dbWriteLimiter, accountController.createAccount)


/**
 * - GET /api/account/  
 * - Get all accounts of the logged in user
 * - Protected Route
 */
router.get('/', authmiddleware, dbReadLimiter, accountController.getAccountDetails)
/**
 * - GET /api/account/balance/:accountId
 * - Get balance of a specific account
 * - Protected Route
 */
router.get('/balance/:accountId', authmiddleware, dbReadLimiter, accountController.getAccountBalance)

module.exports = router
