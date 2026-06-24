const mongoose = require('mongoose')
const accountModel = require('../models/account.model')
const kycModel = require('../models/kyc.models')
const Kyc = require('../controller/Kyc.controller')
const bcrypt = require('bcryptjs')
const JWT = require('jsonwebtoken')


async function createAccount(req, res, next) {
    try {
        const user = req.user
        const KycRecord = await kycModel.findOne({ UserId: user._id })

        if (!KycRecord) {
            return res.status(403).json({
              message: "Account creation blocked. You must submit your KYC details first.",
                status: "failed"
             })
        }

       if (KycRecord.status !== 'Approve') {

            if (KycRecord.status === 'Rejected') {
                return res.status(403).json({
                    message: "Account creation blocked. Your KYC application was rejected.",
                    reason: KycRecord.rejectReason, 
                    status: "failed"
                });
            }

            return res.status(403).json({
                message: "Account creation blocked. Your KYC verification is currently pending by admin  approval.",
                status: "failed"
            });
        }

        const account = await accountModel.create({
            user: user._id,
            isKycVerified: true,
            
        })

      return res.status(201).json({
            message: "Bank account created successfully.",
            status: "success",
            account
        });
    } catch (error) {
        next(error)
    }
}

async function getAccountDetails(req, res, next) {

    try {                       
        const accounts = await accountModel.find({ user: req.user._id })
        return res.status(200).json({
            accounts
        })
    } catch (error) {

    }
}

async function getAccountBalance(req, res, next) {
    try {
    const { accountId } = req.params

    const account = await accountModel.findOne({
        _id: accountId,
        user: req.user._id
    })

    if (!account) {
        return res.status(404).json({
            message: "Account not found"
        })
    }
    const balance = await account.getBalance()

    return res.status(200).json({
        accountId: account._id,
        balance: balance
    })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    createAccount,
    getAccountDetails,
    getAccountBalance
}
