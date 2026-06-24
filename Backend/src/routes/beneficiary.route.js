const express = require('express')
const beneficiary = require('../controller/beneficiary.controller')
const authRouter = express.Router();

/**
 * POST /api/beneficiary/add-beneficiary
 */
authRouter.post('/add-beneficiary', beneficiary.addBeneficiaries)
/**
 * POST /api/beneficiary/:id
 */
authRouter.post('/verify', beneficiary.verifyBeneficiary)

 // GET /api/beneficiary/get-beneficiary
authRouter.get('/get-beneficiary/:userId', beneficiary.getBeneficiaries)


module.exports = authRouter
