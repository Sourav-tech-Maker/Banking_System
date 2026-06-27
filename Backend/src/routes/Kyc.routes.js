const express = require('express')
const Kyc = require('../controller/Kyc.controller')
const authmiddleware = require('../middleware/auth.middleware')
const Router = express.Router();

// POST /api/Kyc/register-kyc
Router.post('/register-kyc', authmiddleware, Kyc.registerKyc)
// POST /api/Kyc/verify-kyc
Router.post('/verify-kyc', Kyc.verifyKyc)
module.exports = Router
