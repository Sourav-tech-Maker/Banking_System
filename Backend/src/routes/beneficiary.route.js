const express = require('express')
const beneficiary = require('../controller/beneficiary.controller')
const authMiddleware = require('../middleware/auth.middleware')
const authRouter = express.Router();

/**
 * POST /api/beneficiary/add-beneficiary
 */
authRouter.post('/add-beneficiary',authMiddleware, beneficiary.addBeneficiaries)
/**
 * POST /api/beneficiary/:id
 */
authRouter.post('/verify',authMiddleware, beneficiary.verifyBeneficiary)

 // GET /api/beneficiary/get-beneficiary
authRouter.get('/get-beneficiary',authMiddleware, beneficiary.getBeneficiaries)


module.exports = authRouter
