const mongoose = require('mongoose')
const { applyTimestamps } = require('./user.model')
const ledgerModel = require('./ledger.model')

const accountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
        index: true
    },

    accountType: {
        type: String,
        enum: ["Savings", "Current"],
        default: "Savings"
    },

    nickname: {
        type: String,
        default: ""
    },

    status: {
        type: String,
        enum: {
            values: ["Active", "Frozen", "Closed"],
        },
        default: "Active"
    },

    currency: {
        type: String,
        required: [true, "Currency is required for creating account"],
        default: "INR"
    },

    kyc: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "KYC",
        default: null
    },

    isKycVerified: {
        type: Boolean,
        default: false
    },

    systemUser: {
        type: Boolean,
        default: false
    },

}, {
    timestamps: true
})

accountSchema.index({ user: 1, status: 1 }) // compound index
accountSchema.methods.getBalance = async function () {

    const ledgerModel = require('./ledger.model')
    // Calculate balance by aggregating ledger entries
    const balanceData = await ledgerModel.aggregate([
        { $match: { account: this._id } },
        {
            $group: {
                _id: null,
                totalDebit: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", "Debit"] },
                            "$amount",
                            0
                        ]
                    }
                },
                totalCredit: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", "Credit"] },
                            "$amount",
                            0
                        ]
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                balance: { $subtract: ["$totalCredit", "$totalDebit"] }
            }
        }

    ])

    // If there are no ledger entries, balance is 0
    if (balanceData.length === 0) {
        return 0;
    }
    return balanceData[0].balance;
}

const accountModel = mongoose.model("account", accountSchema)
module.exports = accountModel
