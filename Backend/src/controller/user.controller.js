const accountModel = require('../models/account.model')
const kycModel = require('../models/kyc.models')

/**
 * GET /api/user/profile
 * Returns user profile with KYC status and account info
 */
async function getProfile(req, res, next) {
    try {
        const user = req.user
        const kycRecord = await kycModel.findOne({ UserId: user._id })
        const accounts = await accountModel.find({ user: user._id })
        const accountsWithBalance = []

        for (const account of accounts) {
            const balance = await account.getBalance()
            accountsWithBalance.push({
                accountId: account._id,
                accountType: account.accountType,
                status: account.status,
                isKycVerified: account.isKycVerified,
                balance
            })
        }

        return res.status(200).json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                verified: user.verified,
                status: user.status,
                createdAt: user.createdAt
            },
            kyc: kycRecord ? {
                status: kycRecord.status,
                FullName: kycRecord.FullName,
                dateOfBirth: kycRecord.dateOfBirth,
                gender: kycRecord.gender,
                permanentAddress: kycRecord.permanentAddress,
                documentType: kycRecord.documentType,
                documentNumber: kycRecord.documentNumber,
                documentImg: kycRecord.documentImg,
                rejectReason: kycRecord.rejectReason
            } : null,
            accounts: accountsWithBalance
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getProfile
}
