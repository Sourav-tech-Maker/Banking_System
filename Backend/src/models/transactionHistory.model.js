const mongoose = require('mongoose');

const transacHistorySchema = new mongoose.Schema({
    transactionReference: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    idempotencyKey: {
        type: String,
        required: true,
        unique: true,
        immutable: true
    },

    ip: {
        type: String,
        required: [true, "IP address is required"],
        trim: true
    },
    userAgent: {
        type: String,
        required: [true, "User agent is required"],
        trim: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    senderAccountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account'
    },
    receiverAccountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account'
    },

    amount: {
        type: mongoose.Schema.Types.Decimal128,
        required: true,
        immutable: true
    },

    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'],
        default: 'PENDING',
        index: true
    },
    paymentMethod: {
        type: String,
        enum: ['UPI', 'WALLET', 'NET_BANKING', 'CARD'],
        required: true
    },
    category: {
        type: String,
        enum: ['PEER_TO_PEER', 'MERCHANT_PAYMENT', 'RECHARGE', 'UTILITY_BILL'],
        default: 'PEER_TO_PEER'
    },
    narration: {
        type: String,
        trim: true
    }
}, { timestamps: true });


transacHistorySchema.index({ senderId: 1, createdAt: -1 });
transacHistorySchema.index({ receiverId: 1, createdAt: -1 });

const transacHistroyModel = mongoose.model('TransacHistory', transacHistorySchema);
module.exports = transacHistroyModel
