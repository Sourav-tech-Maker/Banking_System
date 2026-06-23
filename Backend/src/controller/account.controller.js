const mongoose = require('mongoose')
const accountModel = require('../models/account.model')
const kycModel = require('../models/kyc.models')
const bcrypt = require('bcryptjs')
const JWT = require('jsonwebtoken')


async function createAccountController(req, res, next) {
    try {
        const user = req.user
        const KycRecord = await kycModel.findOne({
            userId: user._id
        })

        if (!KycRecord) {
            return res.status(403).json({
                message: "Access Denied. You must submit your KYC documents before opening an account."
            })
        }

        if (KycRecord.status != 'Approve') {
            if (KycRecord.status === 'Rejected') {
                return res.status(403).json({
                    message: "KYC Status MUST be APPROVE for Open ACCOUNT",
                    reason: kycRecord.rejectReason
                })
            }

            return res.status(403).json({
                message: "KYC Status MUST be APPROVE for Open ACCOUNT",
                reason: "Your documents are still under verification."
            })
        }
        const account = await accountModel.create({
            user: user._id
        })

        res.status(201).json({
            account
        })
    } catch (error) {
        next(error)
    }
}

async function getAccountDetailsController(req, res, next) {

    try {                       
        const accounts = await accountModel.find({ user: req.user._id })
        return res.status(200).json({
            accounts
        })
    } catch (error) {

    }
}

async function getAccountBalanceController(req, res, next) {
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
    createAccountController,
    getAccountDetailsController,
    getAccountBalanceController
}
