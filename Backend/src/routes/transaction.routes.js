const express = require('express')
const authMiddleware = require('../middleware/auth.middleware')
const transactionController = require('../controller/transcation.controller')
const authmiddleware = require('../middleware/auth.middleware')
const transactionRoutes = express.Router()

transactionRoutes.post('/',authMiddleware, transactionController.createTransaction)
transactionRoutes.post('/system/initial-funds', authmiddleware.authSystemUserMiddleware, transactionController.createInitialFundsTransaction)   

module.exports = transactionRoutes

