const mongoose = require('mongoose')
const ledgerModel = require('../models/ledger.model')
const emailService = require('../services/email.service')
const accountModel = require('../models/account.model')
const transactionModel = require('../models/transaction.model')
const jwt = require('jsonwebtoken')
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
async function createTransaction(req, res, next) {

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
    })
    const toAccountData = await accountModel.findById(toAccount)
    if (!FromAccountData || !toAccountData) {
        return res.status(404).json({
            message: "FromAccount or toAccount are not found!..."
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

    if (balance < amount) {
        return res.status(400).json({
            message: `Insufficient balance to process transcation Current balance is ${balance}. Required balance is ${amount}`
        })
    }

    /**
     * 5.Create transaction (PENDING)
     */

    // start a session for transaction
    
    let transaction
    try {
       const  session = await mongoose.startSession()
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
            FromAccountData.user.name,
             amount,
              `Transaction ID: ${transaction._id}\n
              From Account: ${FromAccountData._id}\n
              To Account: ${toAccountData._id}\n
              Amount: ${amount}\n
              Status: Completed`)

        // send email to receiver
        await emailService.sendTransactionEmail(toAccountData.user.email, toAccountData.user.name, amount, `Transaction ID: ${transaction._id}\nFrom Account: ${FromAccountData._id}\nTo Account: ${toAccountData._id}\nAmount: ${amount}\nStatus: Completed`)

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
            FromAccountData.user.name,
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

async function createInitialFundsTransaction(req, res, next) {
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

module.exports = {
    createTransaction,
    createInitialFundsTransaction
}
