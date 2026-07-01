const userModel = require('../models/user.model')
const accountModel = require('../models/account.model')
const kycModel = require('../models/kyc.models')
const transactionModel = require('../models/transaction.model')
const ledgerModel = require('../models/ledger.model')
const mongoose = require('mongoose')

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
        const totalUsers = await userModel.countDocuments({ role: 'user' })
        const totalAccounts = await accountModel.countDocuments()
        const totalTransactions = await transactionModel.countDocuments()

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
        const users = await userModel.find({ role: 'user' }).lean()
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

/**
 * PUT /api/admin/users/:userId/status
 * Update user status (Active, Suspended, Locked)
 */
async function updateUserStatus(req, res, next) {
    try {
        const { userId } = req.params
        const { status } = req.body

        if (!status) {
            return res.status(400).json({ message: "Status is required" })
        }

        const user = await userModel.findByIdAndUpdate(
            userId,
            { status },
            { new: true }
        )

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        return res.status(200).json({
            message: `User status updated to ${status}`,
            user
        })
    } catch (error) {
        next(error)
    }
}

/**
 * POST /api/admin/users/:userId/reset-attempts
 * Reset failed login attempts and lock status
 */
async function resetUserLogins(req, res, next) {
    try {
        const { userId } = req.params

        const user = await userModel.findByIdAndUpdate(
            userId,
            { loginAttempts: 0, lockUntil: null, status: "Active" },
            { new: true }
        )

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        return res.status(200).json({
            message: "User login attempts reset successfully",
            user
        })
    } catch (error) {
        next(error)
    }
}

/**
 * PUT /api/admin/accounts/:accountId/status
 * Update bank account status (Active, Frozen, Closed)
 */
async function updateAccountStatus(req, res, next) {
    try {
        const { accountId } = req.params
        const { status } = req.body

        if (!status) {
            return res.status(400).json({ message: "Status is required" })
        }

        const account = await accountModel.findByIdAndUpdate(
            accountId,
            { status },
            { new: true }
        )

        if (!account) {
            return res.status(404).json({ message: "Account not found" })
        }

        return res.status(200).json({
            message: `Account status updated to ${status}`,
            account
        })
    } catch (error) {
        next(error)
    }
}

/**
 * GET /api/admin/transactions
 * Get list of all transactions
 */
async function getAllTransactions(req, res, next) {
    try {
        const transactions = await transactionModel.find()
            .populate({
                path: 'FromAccount',
                populate: { path: 'user', select: 'username email' }
            })
            .populate({
                path: 'toAccount',
                populate: { path: 'user', select: 'username email' }
            })
            .sort({ createdAt: -1 })

        return res.status(200).json({
            status: "success",
            results: transactions.length,
            transactions
        })
    } catch (error) {
        next(error)
    }
}

/**
 * POST /api/admin/transactions/:transactionId/reverse
 * Reverse a completed transaction
 */
async function reverseTransaction(req, res, next) {
    const { transactionId } = req.params
    let session
    try {
        const transaction = await transactionModel.findById(transactionId)
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" })
        }

        if (transaction.status === "Reversed") {
            return res.status(400).json({ message: "Transaction is already reversed" })
        }

        const FromAccountData = await accountModel.findById(transaction.FromAccount)
        const toAccountData = await accountModel.findById(transaction.toAccount)

        if (!FromAccountData || !toAccountData) {
            return res.status(404).json({ message: "Accounts for this transaction not found" })
        }

        const receiverBalance = await toAccountData.getBalance()
        if (receiverBalance < transaction.amount) {
            return res.status(400).json({
                message: `Receiver has insufficient balance to reverse transaction. Current balance: ${receiverBalance}`
            })
        }

        session = await mongoose.startSession()
        session.startTransaction()

       
        await ledgerModel.create([{
            account: transaction.FromAccount,
            amount: transaction.amount,
            transaction: transaction._id,
            type: 'Credit'
        }], { session })

        await ledgerModel.create([{
            account: transaction.toAccount,
            amount: transaction.amount,
            transaction: transaction._id,
            type: 'Debit'
        }], { session })

        
        transaction.status = 'Reversed'
        await transaction.save({ session })

        await session.commitTransaction()
        session.endSession()

        return res.status(200).json({
            message: "Transaction reversed successfully",
            transaction
        })
    } catch (error) {
        if (session) {
            await session.abortTransaction()
            session.endSession()
        }
        next(error)
    }
}

/**
 * DELETE /api/admin/kyc/:kycId
 * Permanently delete a processed KYC application (Approved or Rejected)
 * Allows admin to clean up fake or rejected KYC records from the system
 */
async function deleteKycApplication(req, res, next) {
    try {
        const { kycId } = req.params

        const kycRecord = await kycModel.findById(kycId)
        if (!kycRecord) {
            return res.status(404).json({
                message: "KYC application not found",
                status: "failed"
            })
        }

        if (kycRecord.status === 'Pending') {
            return res.status(400).json({
                message: "Cannot delete a pending KYC application. Approve or reject it first.",
                status: "failed"
            })
        }
        if (kycRecord.status === 'Approve') {
            await accountModel.updateMany(
                { user: kycRecord.UserId },
                { isKycVerified: false }
            )
        }

        await userModel.findByIdAndUpdate(kycRecord.UserId, { kyc: null })

        // Delete the KYC record permanently
        await kycModel.findByIdAndDelete(kycId)

        return res.status(200).json({
            message: "KYC application deleted successfully. User can now re-submit KYC.",
            status: "success"
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getKycApplications,
    getAdminStats,
    getAllUsers,
    updateUserStatus,
    resetUserLogins,
    updateAccountStatus,
    getAllTransactions,
    reverseTransaction,
    deleteKycApplication
}
