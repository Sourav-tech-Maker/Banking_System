const express = require('express')
const beneficiary = require('../controller/beneficiary.controller')
const authMiddleware = require('../middleware/auth.middleware')
const { dbReadLimiter, dbWriteLimiter } = require('../middleware/rateLimiter.middleware')
const authRouter = express.Router();

/**
 * POST /api/beneficiary/add-beneficiary
 */
authRouter.post('/add-beneficiary', authMiddleware, dbWriteLimiter, beneficiary.addBeneficiaries)
/**
 * POST /api/beneficiary/:id
 */
authRouter.post('/verify', authMiddleware, dbWriteLimiter, beneficiary.verifyBeneficiary)

 // GET /api/beneficiary/get-beneficiary
authRouter.get('/get-beneficiary', authMiddleware, dbReadLimiter, beneficiary.getBeneficiaries)

// DELETE /api/beneficiary/:beneficiaryId
authRouter.delete('/:beneficiaryId', authMiddleware, dbWriteLimiter, beneficiary.deleteBeneficiary)


module.exports = authRouter
