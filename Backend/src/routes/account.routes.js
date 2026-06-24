const express = require('express')
const authmiddleware = require("../middleware/auth.middleware")
const accountController = require('../controller/account.controller')
const router = express.Router()

/**
 * - POST /api/account/
 * - create a new account 
 */ 
router.post('/', authmiddleware, accountController.createAccount)


/**
 * - GET /api/account/
 * - Get all accounts of the logged in user
 * - Protected Route
 */
router.get('/', authmiddleware, accountController.getAccountDetails)
/**
 * - GET /api/account/balance/:accountId
 * - Get balance of a specific account
 * - Protected Route
 */
router.get('/balance/:accountId', authmiddleware, accountController.getAccountBalance)

module.exports = router
