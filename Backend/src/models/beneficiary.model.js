const mongoose = require('mongoose')

const beneficiarySchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: [true, "USER_ID is required"],
        index: true
    },

    fullName: {
        type: String,
        required: true,
        trim: true
    },
    nickName: {
        type: String,
        trim: true,
        maxLength: 20
    },

    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: true,
        trim: true
    },

    bankName: {
        type: String,
        default: "YONO App"
    },
    accountType: {
        type: String,
        enum: ['Savings', 'Checking', 'Current'],
        default: 'Savings'
    },


    otp: {
        type: String
    },
    otpExpiresAt: {
        type: Date
    },
    status: {
        type: String,
        enum: ['Pending', 'Active', 'Suspended'],
        default: 'Pending'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationCode: {
        type: String
    },
    codeExpiresAt: {
        type: Date
    }

}, { timestamps: true })

beneficiarySchema.index({ userId: 1, accountId: 1 }, { unique: true })
const beneficiaryModel = mongoose.model('Beneficiary', beneficiarySchema)

module.exports = beneficiaryModel;

