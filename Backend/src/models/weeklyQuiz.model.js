const mongoose = require('mongoose')

const quizQuestionSchema = new mongoose.Schema({
    topic: {
        type: String,
        required: true,
        trim: true
    },
    question: {
        type: String,
        required: true,
        trim: true
    },
    options: {
        type: [String],
        required: true,
        validate: {
            validator: (options) => options.length >= 2,
            message: 'A quiz question must have at least two options'
        }
    },
    correctAnswer: {
        type: String,
        required: true,
        select: false
    }
})

const weeklyQuizSchema = new mongoose.Schema({
    weekKey: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    entryFee: {
        type: Number,
        default: 10
    },
    prizePool: {
        type: Number,
        default: 500
    },
    durationSeconds: {
        type: Number,
        default: 15 * 60
    },
    questionSeconds: {
        type: Number,
        default: 20
    },
    status: {
        type: String,
        enum: ['ready', 'locked', 'closed'],
        default: 'ready',
        index: true
    },
    startsAt: {
        type: Date,
        default: Date.now
    },
    endsAt: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    questions: {
        type: [quizQuestionSchema],
        required: true,
        validate: {
            validator: (questions) => questions.length > 0,
            message: 'A quiz must contain at least one question'
        }
    }
}, {
    timestamps: true
})

const weeklyQuizModel = mongoose.model('weeklyQuiz', weeklyQuizSchema)

module.exports = weeklyQuizModel
