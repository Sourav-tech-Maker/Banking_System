const mongoose = require('mongoose');
const transactionSchema = new mongoose.Schema({

    FromAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "Transaction must have a source account"],
        index: true
    },
    toAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "Transaction must have a destination account"],
        index: true
    },

    status:{
        type: String,
        enum: {
            values: ["Pending", "Completed", "failed", "Reversed"],
            message: "Status must be one of the following: Pending, completed, failed, Reversed"
    },
    default: "Pending"
    },
    amount: {
        type: Number,
        required: [true, "Transaction must have an amount"],
        min: [0, "Transaction amount must be greater than 0"] 

    },

    /**
     * - It helps to prevent duplicate transactions in case of network issues or retries.
     * - The idempotency key is a unique identifier for each transaction request, 
     * - ensuring that even if the same request is sent multiple times, it will only be processed once.
    */
    idempotencyKey: {
        type: String,
        required: [true, "Transaction must have an idempotency key"],
        unique: true,
        index: true
    },

}, {
    timestamps: true
})

const transactionModel = mongoose.model("transaction", transactionSchema)

module.exports = transactionModel
