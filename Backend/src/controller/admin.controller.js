const userModel = require('../models/user.model')
const accountModel = require('../models/account.model')
const kycModel = require('../models/kyc.models')
const transactionModel = require('../models/transaction.model')

/**
 * GET /api/admin/kyc-applications
 * Get all KYC applications in the system
 */
async function getKycApplications(req, res, next) {
    try {
        const { status } = req.query
        let query = {}
        if (status) {
            query.status = status
        }

        const applications = await kycModel.find(query)
            .sort({ status: 1, createdAt: -1 }) 
            .populate('UserId', 'username email')

        return res.status(200).json({
            status: "success",
            results: applications.length,
            applications
        })
    } catch (error) {
        next(error)
    }
}

/**
 * GET /api/admin/stats
 * Get aggregated banking system stats
 */
async function getAdminStats(req, res, next) {
    try {
        const totalUsers = await userModel.countDocuments({ role: { $ne: 'admin' } })
        const totalAccounts = await accountModel.countDocuments()
        const totalTransactions = await transactionModel.countDocuments()

        // Sum balances across all accounts
        const accounts = await accountModel.find()
        let totalSystemBalance = 0
        for (const account of accounts) {
            totalSystemBalance += await account.getBalance()
        }

        // Get KYC stats
        const pendingKyc = await kycModel.countDocuments({ status: 'Pending' })
        const approvedKyc = await kycModel.countDocuments({ status: 'Approve' })
        const rejectedKyc = await kycModel.countDocuments({ status: 'Rejected' })

        return res.status(200).json({
            stats: {
                totalUsers,
                totalAccounts,
                totalTransactions,
                totalSystemBalance,
                kyc: {
                    pending: pendingKyc,
                    approved: approvedKyc,
                    rejected: rejectedKyc
                }
            }
        })
    } catch (error) {
        next(error)
    }
}

/**
 * GET /api/admin/users
 * Get list of all registered users (excluding admins) with their accounts
 */
async function getAllUsers(req, res, next) {
    try {
        const users = await userModel.find({ role: { $ne: 'admin' } }).lean()
        const userList = await Promise.all(users.map(async (user) => {
            const accounts = await accountModel.find({ user: user._id })
            const accountsWithBalance = await Promise.all(accounts.map(async (acc) => {
                const balance = await acc.getBalance()
                return {
                    id: acc._id,
                    accountType: acc.accountType,
                    status: acc.status,
                    balance
                }
            }))

            const kycRecord = await kycModel.findOne({ UserId: user._id })

            return {
                id: user._id,
                username: user.username,
                email: user.email,
                verified: user.verified,
                status: user.status,
                createdAt: user.createdAt,
                kycStatus: kycRecord ? kycRecord.status : 'Not Submitted',
                accounts: accountsWithBalance
            }
        }))

        return res.status(200).json({
            status: "success",
            results: userList.length,
            users: userList
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getKycApplications,
    getAdminStats,
    getAllUsers
}
