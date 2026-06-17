const mongoose = require('mongoose')

/**
 * - The ledger model represents the financial records associated with an account.
 * - Each ledger entry is linked to a specific account and contains details about the transactions and balances.
 * - The ledger model is designed to maintain a historical record of all financial activities for an account, ensuring transparency and accountability.
 */

const ledgerSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "Ledger must be associated with an account"],
        index: true,
        immutable: true,
    },
    amount: {
        type: Number,
        required: [true, "Ledger entry must have an amount"],
        immutable: true, // 
    },
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "transaction",
        required: [true, "Ledger entry must be associated with a transaction"],
        index: true,
    },

    type: {
        type: String,
        enum: {
            values: ["Credit", "Debit"],
            message: "Ledger type must be either 'Credit' or 'Debit'"
        },
        required: [true, "Ledger entry must have a type (credit or debit)"],
        immutable: true,
    },
})

function preventLedgerModification() {
    throw new Error("Ledger entries are immutable and cannot be modified or deleted after creation.");
}
// .pre hooks to prevent updates or deletions of ledger entries 
ledgerSchema.pre('findOneAndUpdate', preventLedgerModification);
ledgerSchema.pre('updateOne', preventLedgerModification);
ledgerSchema.pre('deleteOne', preventLedgerModification);
ledgerSchema.pre('remove', preventLedgerModification);
ledgerSchema.pre('deleteMany', preventLedgerModification); 
ledgerSchema.pre('updateMany', preventLedgerModification); 
ledgerSchema.pre('findOneAndDelete', preventLedgerModification); 
ledgerSchema.pre('findOneAndReplace', preventLedgerModification); 

const ledgerModel = mongoose.model("ledger", ledgerSchema)
module.exports = ledgerModel
