const accountModel = require('../models/account.model')
const ledgerModel = require('../models/ledger.model')
const transactionModel = require('../models/transaction.model')
const kycModel = require('../models/kyc.models')

const chartColors = ['#6D5DFB', '#2F80ED', '#22C55E', '#F59E0B', '#EF4444']

function getAccountObjectId(account) {
    return account?._id || account
}

function formatAccountParty(account) {
    if (!account) {
        return {
            id: null,
            holderName: 'Unknown account holder',
            email: '',
            accountType: 'Account',
            shortAccountId: 'Unknown'
        }
    }

    const accountId = String(getAccountObjectId(account))
    const user = account.user || {}

    return {
        id: accountId,
        holderName: user.username || user.name || 'Account holder',
        email: user.email || '',
        accountType: account.accountType || 'Account',
        shortAccountId: `A/C ${accountId.slice(-6).toUpperCase()}`
    }
}

function getWeekNumber(date = new Date()) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000

    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

/**
 * Get aggregated dashboard data for a user
 * @param {Object} user - The authenticated user document from req.user
 * @returns {Object} Dashboard data with user info, summary, recent transactions, and KYC details
 */
async function getDashboardData(user) {

    const accounts = await accountModel.find({ user: user._id })
    const accountIds = accounts.map(acc => acc._id)

    const kycRecord = await kycModel.findOne({ UserId: user._id })
    const kycStatus = kycRecord ? kycRecord.status : 'Not Submitted'

    let totalBalance = 0
    for (const account of accounts) {
        const balance = await account.getBalance()
        totalBalance += balance
    }

    const ledgerAggregation = await ledgerModel.aggregate([
        { $match: { account: { $in: accountIds } } },
        {
            $group: {
                _id: null,
                totalIncome: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", "Credit"] },
                            "$amount",
                            0
                        ]
                    }
                },
                totalExpense: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", "Debit"] },
                            "$amount",
                            0
                        ]
                    }
                }
            }
        }
    ])

    const totalIncome = ledgerAggregation.length > 0 ? ledgerAggregation[0].totalIncome : 0
    const totalExpense = ledgerAggregation.length > 0 ? ledgerAggregation[0].totalExpense : 0

    // 5. Build spending analytics from completed outgoing transfers.
    const outgoingTransfers = await transactionModel.find({
        FromAccount: { $in: accountIds },
        status: 'Completed'
    })

    const bankTransferExpense = outgoingTransfers.reduce((total, transaction) => {
        return total + Number(transaction.amount || 0)
    }, 0)

    const spendingCategories = bankTransferExpense > 0
        ? [{
            name: 'Bank Transfers',
            amount: bankTransferExpense,
            percentage: 100,
            color: chartColors[0]
        }]
        : []

    // 6. Calculate YONO App coins
    const activeAccounts = accounts.filter(acc => acc.status === 'Active').length
    const ONEO_BankCoins = Math.floor(totalBalance / 1000) + activeAccounts * 50
    const completedTransactionCount = await transactionModel.countDocuments({
        status: 'Completed',
        $or: [
            { FromAccount: { $in: accountIds } },
            { toAccount: { $in: accountIds } }
        ]
    })

    // 7. Get recent transactions (last 10)
    const recentTransactionsRaw = await transactionModel.find({
        $or: [
            { FromAccount: { $in: accountIds } },
            { toAccount: { $in: accountIds } }
        ]
    })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate({
            path: 'FromAccount',
            select: '_id accountType currency user',
            populate: {
                path: 'user',
                select: 'username email'
            }
        })
        .populate({
            path: 'toAccount',
            select: '_id accountType currency user',
            populate: {
                path: 'user',
                select: 'username email'
            }
        })

    // 8. Map transactions with direction and readable account holder names
    const recentTransactions = recentTransactionsRaw.map(txn => {
        const fromAccountId = getAccountObjectId(txn.FromAccount)
        const isDebit = accountIds.some(id => id.equals(fromAccountId))
        const fromParty = formatAccountParty(txn.FromAccount)
        const toParty = formatAccountParty(txn.toAccount)
        const counterparty = isDebit ? toParty : fromParty

        return {
            id: txn._id,
            amount: txn.amount,
            status: txn.status,
            title: isDebit ? 'Outgoing Transfer' : 'Incoming Transfer',
            category: 'Bank Transfer',
            date: txn.createdAt,
            createdAt: txn.createdAt,
            direction: isDebit ? 'debit' : 'credit',
            fromAccount: fromParty,
            toAccount: toParty,
            senderName: fromParty.holderName,
            receiverName: toParty.holderName,
            counterparty,
            otherAccount: `${counterparty.holderName} · ${counterparty.shortAccountId}`
        }
    })

    // 9. Build response
    return {
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            verified: user.verified,
            kycStatus: kycStatus
        },
        summary: {
            totalBalance,
            totalIncome,
            totalExpense,
            ONEO_BankCoins,
            totalAccounts: accounts.length,
            accountStatus: accounts.length > 0 ? accounts[0].status : 'No Account'
        },
        recentTransactions,
        analytics: {
            totalExpense,
            categories: spendingCategories
        },
        aiInsights: {
            headline: recentTransactions.length ? 'Activity is now visible' : 'Your activity is ready to grow',
            message: recentTransactions.length
                ? 'Your dashboard is using live transfers to show balances, spending, and rewards.'
                : 'Start using your account to unlock spending patterns and saving suggestions.',
            savingsPotential: Math.round(totalExpense * 0.12),
            items: recentTransactions.length
                ? [
                    {
                        type: 'insight',
                        title: 'Transfer visibility',
                        message: 'Transaction rows now show sender and receiver names with account references.'
                    },
                    {
                        type: 'tip',
                        title: 'Spending clarity',
                        message: 'Outgoing transfers are grouped under Bank Transfers until detailed categories are added.'
                    }
                ]
                : []
        },
        spendingByCategory: spendingCategories,
        kycDetails: kycRecord ? {
            status: kycRecord.status,
            submittedAt: kycRecord.createdAt
        } : null
    }
}

module.exports = {
    getDashboardData
}
