const mongoose = require('mongoose')

const quizAnswerSchema = new mongoose.Schema({
    
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    selectedOption: {
        type: String,
        default: ''
    },

    isCorrect: {
        type: Boolean,
        default: false
    },
    
    answeredAt: {
        type: Date,
        default: Date.now
    }
}, {
    _id: false
})

const antiCheatEventSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    message: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    _id: false
})

const quizAttemptSchema = new mongoose.Schema({
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'weeklyQuiz',
        required: true,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['IN_PROGRESS', 'SUBMITTED', 'TERMINATED'],
        default: 'IN_PROGRESS',
        index: true
    },
    orderedQuestionIds: {
        type: [mongoose.Schema.Types.ObjectId],
        default: []
    },
    answers: {
        type: [quizAnswerSchema],
        default: []
    },
    antiCheatEvents: {
        type: [antiCheatEventSchema],
        default: []
    },
    score: {
        type: Number,
        default: 0
    },
    earnedCoins: {
        type: Number,
        default: 0
    },
    mediaConsent: {
        camera: {
            type: Boolean,
            default: false
        },
        microphone: {
            type: Boolean,
            default: false
        }
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    submittedAt: Date,
    terminatedAt: Date,
    terminationReason: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
})

quizAttemptSchema.index({ user: 1, quiz: 1, createdAt: -1 })

const quizAttemptModel = mongoose.model('quizAttempt', quizAttemptSchema)

module.exports = quizAttemptModel
