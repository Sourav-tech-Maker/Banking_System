const mongoose = require('mongoose')

const GoalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'User ID is required'],
        index: true
    },

    title: {
        type: String,
        required: [true, 'Goal title is required'],
        trim : true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    category: {
        type: String,
       required: [true, 'Category is required'],
        trim: true,
        lowercase: true
    },

    targetAmount: {
        type: Number,
      required: [true, 'Target amount is required'],
    },

    currentAmount: {
        type: Number,
        default: 0,
        required: true,
        min: [0, 'Current amount cannot be negative']
    },

    targetDate:{
        type: Date,
        required: [true, 'Target date is required'],
        validate: {
            validator: function(value) {
                return value > new Date();
            },
            message: 'Target date must be in the future'
        }
    },

    status: {
        type: String,
     enum: {
            values: ['active', 'completed'],
            message: '{VALUE} is not a valid status'
        },
       default: 'active',
       index: true
    }
}, {timestamps: true})




GoalSchema.virtual('remainingAmount').get(function() {
    const remaining = this.targetAmount - this.currentAmount;
    return remaining > 0 ? remaining : 0;
});

// Calculate progress percentage dynamically
// It isn't stored in the database—it is calculated automatically whenever you access the document.
GoalSchema.virtual('progressPercentage').get(function() {
    if (this.targetAmount === 0) return 0;
    const percentage = (this.currentAmount / this.targetAmount) * 100;
    return Math.min(Math.round(percentage), 100); 
})

GoalSchema.pre('save', function(next) {
    if (this.currentAmount >= this.targetAmount) {
        this.status = 'completed';
    } else {
        this.status = 'active';
    }
    next();
});                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 

const GoalModel = mongoose.Model('Goal', GoalSchema)
module.exports = GoalModel
