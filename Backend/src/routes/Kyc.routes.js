const express = require('express')
const Kyc = require('../controller/Kyc.controller')
const Router = express.Router();

// POST /api/Kyc/register-kyc
Router.post('/register-kyc', Kyc.registerKyc)
// POST /api/Kyc/verify-kyc
Router.post('/verify-kyc', Kyc.verifyKyc)
module.exports = Router
