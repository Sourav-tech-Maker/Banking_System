const mongoose = require('mongoose');

const SavingsLogSchema = new mongoose.Schema({
    goalId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Goal', 
        required: [true, 'Goal ID connection is required'],
        index: true /
    },
    amountAdded: {
        type: Number,
        required: [true, 'Saved amount is required'],
        min: [0.01, 'Amount added must be greater than 0'],
        immutable: true 
    },
    type: { 
        type: String,
        enum: {
            values: ['manual', 'auto-debit', 'round-up'],
            message: '{VALUE} is not a valid transaction type'
        },
        default: 'manual',
        immutable: true
    }
}, { 
    timestamps: true 
});
