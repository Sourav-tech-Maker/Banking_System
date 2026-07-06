const mongoose = require('mongoose')
const ledgerModel = require('../models/ledger.model')
const emailService = require('../services/email.service')
const accountModel = require('../models/account.model')
const transactionModel = require('../models/transaction.model')

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

function accountBelongsToUser(account, userId) {
    const ownerId = account?.user?._id || account?.user
    return ownerId && ownerId.equals(userId)
}

const accountPopulate = {
    path: 'FromAccount',
    select: '_id accountType currency user',
    populate: {
        path: 'user',
        select: 'username email'
    }
}

const receiverAccountPopulate = {
    path: 'toAccount',
    select: '_id accountType currency user',
    populate: {
        path: 'user',
        select: 'username email'
    }
}
/**
 * - Create a new Transcation
 * THE 10-STEP TRANSFER FLOW:
     * 1.Validate request
     * 2.Validate idempotency Key
     * 3.Check account status
     * 4.Derive sender balance from ledger    
     * 5.Create transaction (PENDING)
     * 6.Create ledger entry for sender (DEBIT)
     * 7.Create ledger entry for receiver (CREDIT)
     * 8.Update transaction status to COMPLETED
     * 9.Send response
 */
async function createTransaction(req, res) {

    /**
     * 1. Validate request
     */
    const { FromAccount, toAccount, amount, idempotencyKey } = req.body

    if (!FromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "Missing required fields: FromAccount, toAccount, amount, idempotencyKey"
        })
    }

    const FromAccountData = await accountModel.findOne({
        _id: FromAccount
    }).populate('user', 'username email')
    const toAccountData = await accountModel.findById(toAccount).populate('user', 'username email')
    if (!FromAccountData || !toAccountData) {
        return res.status(404).json({
            message: "FromAccount or toAccount are not found!..."
        })
    }

    // Verify the sender account belongs to the currently logged-in user
    if (!accountBelongsToUser(FromAccountData, req.user._id)) {
        return res.status(403).json({
            message: "You are not authorized to transfer from this account",
            status: 'failed'
        })
    }

    // Check KYC on the actual sender account document
    if (!FromAccountData.isKycVerified) {
        return res.status(403).json({
            message: "You don't have access to creating Transaction. KYC is not verified.",
            status: 'failed'
        })
    }

    /**
     * 2. Validate idempotency Key
     */

    const isTransactionAlreadyExists = await transactionModel.findOne({
        idempotencyKey: idempotencyKey
    })

    if (isTransactionAlreadyExists) {
        if (isTransactionAlreadyExists.status === 'completed') {
            return res.status(200).json({
                message: "Transaction is already processed",
                transaction: isTransactionAlreadyExists
            })
        }
        if (isTransactionAlreadyExists.status === 'Pending') {
            return res.status(200).json({
                message: "Transaction is still processing",
            })
        }
        if (isTransactionAlreadyExists.status === 'failed') {
            return res.status(500).json({
                message: "Transaction processing failed, please retry"
            })
        }

        if (isTransactionAlreadyExists.status === 'Reversed') {
            return res.status(500).json({
                message: 'Transaction was Reversed, please retry'
            })
        }
    }

    /**
     * 3.Check account status
     */

    if (FromAccountData.status !== 'Active' || toAccountData.status !== 'Active') {
        return res.status(400).json({
            message: "Both FromAccount and toAccount must be ACTIVE to process transcation"
        })
    }

    /**
     * 4. Derive sender balance from ledger 
     */

    const balance = await FromAccountData.getBalance()
    const isSystemUser = req.user.role === 'systemUser'

    if (!isSystemUser && balance < amount) {
        return res.status(400).json({
            message: `Insufficient balance to process transcation Current balance is ${balance}. Required balance is ${amount}`
        })
    }

    /**
     * 5.Create transaction (PENDING)
     */

    // start a session for transaction
    let transaction
    let session
    try {
        session = await mongoose.startSession()
        session.startTransaction()

        // create transaction document with status PENDING
        transaction = (await transactionModel.create([{
            FromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: 'Pending'
        }], { session }))[0]
        // transaction = createdTransaction

        const debitLedgerEntry = await ledgerModel.create([{
            account: FromAccount,
            amount: amount,
            transaction: transaction._id,
            type: 'Debit'
        }], { session })

        const creditLedgerEntry = await ledgerModel.create([{
            account: toAccount,
            amount: amount,
            transaction: transaction._id,
            type: 'Credit'
        }], { session })

        // update transaction status to COMPLETED
        await transactionModel.findOneAndUpdate(
            {_id: transaction._id},
            {status: 'Completed'},
            {session}
        )

        await session.commitTransaction()
        session.endSession()

        /**
         * 9.Send response
         */

        // send email to sender
        await emailService.sendTransactionEmail(
            FromAccountData.user.email, 
            FromAccountData.user.username,
             amount,
              `Transaction ID: ${transaction._id}\n
              From Account: ${FromAccountData._id}\n
              To Account: ${toAccountData._id}\n
              Amount: ${amount}\n
              Status: Completed`)

        // send email to receiver
        await emailService.sendTransactionEmail(toAccountData.user.email, toAccountData.user.username, amount, `Transaction ID: ${transaction._id}\nFrom Account: ${FromAccountData._id}\nTo Account: ${toAccountData._id}\nAmount: ${amount}\nStatus: Completed`)

        return res.status(200).json({
            message: "Transaction processed successfully",
            transaction
        })

    } catch (error) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }

        if (transaction) {
            transaction.status = 'failed';
            await transaction.save();
        }

        // send failure email to sender
        await emailService.sendTransactionFailureEmail(
            FromAccountData.user.email,
            FromAccountData.user.username,
            amount,
            toAccountData._id,
            `Transaction ID: ${transaction ? transaction._id : 'N/A'}\nFrom Account: ${FromAccountData._id}\nTo Account: ${toAccountData._id}\nAmount: ${amount}\nStatus: Failed\nReason: ${error.message}`
        );

        return res.status(500).json({
            message: "Transaction processing failed",
            error: error.message
        });
    }

}

async function createInitialFundsTransaction(req, res) {
    const { toAccount, amount, idempotencyKey } = req.body

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "toAccount, amount and idempotencyKey are required "
        })
    }

    const toUserAccount = await accountModel.findOne({ _id: toAccount })

    if (!toUserAccount) {
        return res.status(404).json({
            message: "toAccount not found"
        })
    }

    const fromUserAccountData = await accountModel.findOne({  user: req.user._id })

    if (!fromUserAccountData) {
        return res.status(404).json({
            message: "System user account not found"
        })
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    const transaction = new transactionModel({
        FromAccount: fromUserAccountData._id,
        toAccount,
        amount,
        idempotencyKey,
        status: 'Pending'
    })

    const debitLedgerEntry = await ledgerModel.create([{
        account: fromUserAccountData._id,
        amount: amount,
        transaction: transaction._id,
        type: 'Debit'
    }], { session })
    const creditLedgerEntry = await ledgerModel.create([{
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: 'Credit'
    }], { session })

    transaction.status = 'Completed'
    await transaction.save({ session })

    await session.commitTransaction()
    session.endSession()

    return res.status(201).json({
        message: "Initial funds added successfully",
        transaction
    })
}

/**
 * GET /api/transaction/history
 * Get paginated transaction history for the logged-in user
 * Query params: page, limit, type (all/credit/debit), startDate, endDate
 */
async function getTransactionHistory(req, res, next) {
    try {
        const { page = 1, limit = 20, type = 'all', startDate, endDate } = req.query
        const pageNum = parseInt(page)
        const limitNum = parseInt(limit)

        // 1. Find all accounts belonging to the user
        const accounts = await accountModel.find({ user: req.user._id })
        const accountIds = accounts.map(acc => acc._id)

        if (accountIds.length === 0) {
            return res.status(200).json({
                transactions: [],
                pagination: { page: pageNum, limit: limitNum, total: 0, pages: 0 }
            })
        }

        // 2. Build query filter
        let query = {}

        if (type === 'credit') {
            query.toAccount = { $in: accountIds }
        } else if (type === 'debit') {
            query.FromAccount = { $in: accountIds }
        } else {
            query.$or = [
                { FromAccount: { $in: accountIds } },
                { toAccount: { $in: accountIds } }
            ]
        }

        // 3. Apply date range filter
        if (startDate || endDate) {
            query.createdAt = {}
            if (startDate) {
                query.createdAt.$gte = new Date(startDate)
            }
            if (endDate) {
                query.createdAt.$lte = new Date(endDate)
            }
        }

        // 4. Get total count for pagination
        const total = await transactionModel.countDocuments(query)
        const pages = Math.ceil(total / limitNum)

        // 5. Fetch paginated transactions
        const transactions = await transactionModel.find(query)
            .sort({ createdAt: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .populate(accountPopulate)
            .populate(receiverAccountPopulate)

        // 6. Map transactions with direction
        const mappedTransactions = transactions.map(txn => {
            const fromAccountId = getAccountObjectId(txn.FromAccount)
            const toAccountId = getAccountObjectId(txn.toAccount)
            const isDebit = accountIds.some(id => id.equals(fromAccountId))
            const fromParty = formatAccountParty(txn.FromAccount)
            const toParty = formatAccountParty(txn.toAccount)

            return {
                id: txn._id,
                amount: txn.amount,
                status: txn.status,
                direction: isDebit ? 'debit' : 'credit',
                title: isDebit ? 'Outgoing Transfer' : 'Incoming Transfer',
                fromAccount: fromParty,
                toAccount: toParty,
                fromAccountId,
                toAccountId,
                senderName: fromParty.holderName,
                receiverName: toParty.holderName,
                counterparty: isDebit ? toParty : fromParty,
                category: 'Bank Transfer',
                createdAt: txn.createdAt,
                idempotencyKey: txn.idempotencyKey
            }
        })

        return res.status(200).json({
            transactions: mappedTransactions,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages,
                totalPages: pages
            }
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    createTransaction,
    createInitialFundsTransaction,
    getTransactionHistory
}
