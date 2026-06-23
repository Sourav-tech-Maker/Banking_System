const express = require('express')
const beneficiary = require('../controller/beneficiary.controller')
const authRouter = express.Router();

/**
 * POST /api/beneficiary/add-beneficiary
 */
authRouter.post('/add-beneficiary', beneficiary.addbeneficiaries)
/**
 * POST /api/beneficiary/:id
 */
authRouter.post('/:id', beneficiary.verifyBeneficiary)
/**
 * POST /api/beneficiary/get-beneficiary
 */
authRouter.get('/get-beneficiary', beneficiary.getBeneficiaries)


module.exports = authRouter
