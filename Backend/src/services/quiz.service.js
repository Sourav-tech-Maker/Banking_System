const weeklyQuizModel = require('../models/weeklyQuiz.model')
const quizAttemptModel = require('../models/quizAttempt.model')

const defaultQuestionBank = [
    {
        topic: 'Backend Development',
        question: 'Which HTTP status code usually means a user is authenticated but not allowed to access a resource?',
        options: ['401', '403', '404', '500'],
        correctAnswer: '403'
    },
    {
        topic: 'Cyber Security',
        question: 'What is the main purpose of hashing passwords before storing them?',
        options: ['Faster login', 'Readable backups', 'Protecting secrets if data leaks', 'Reducing database size'],
        correctAnswer: 'Protecting secrets if data leaks'
    },
    {
        topic: 'Python',
        question: 'Which Python data type stores key-value pairs?',
        options: ['list', 'tuple', 'dict', 'set'],
        correctAnswer: 'dict'
    },
    {
        topic: 'DevOps',
        question: 'What does CI/CD mainly help teams automate?',
        options: ['Hiring', 'Builds, tests and deployments', 'Bank transfers', 'Password resets'],
        correctAnswer: 'Builds, tests and deployments'
    },
    {
        topic: 'Artificial Intelligence',
        question: 'What is a model inference request?',
        options: ['Training from scratch', 'Using a trained model to generate output', 'Deleting weights', 'Encrypting data'],
        correctAnswer: 'Using a trained model to generate output'
    },
    {
        topic: 'System Design',
        question: 'Why is idempotency useful in payment systems?',
        options: ['It makes UI faster', 'It prevents duplicate processing on retries', 'It removes authentication', 'It increases password length'],
        correctAnswer: 'It prevents duplicate processing on retries'
    },
    {
        topic: 'Banking Security',
        question: 'What is the safest place to store a web session token from JavaScript access?',
        options: ['localStorage', 'Plain text file', 'HTTP-only cookie', 'URL query string'],
        correctAnswer: 'HTTP-only cookie'
    },
    {
        topic: 'Digital Payments',
        question: 'What should a ledger entry be after creation in a banking system?',
        options: ['Editable anytime', 'Immutable', 'Hidden from audits', 'Deleted monthly'],
        correctAnswer: 'Immutable'
    },
    {
        topic: 'General Technology',
        question: 'Which database is commonly used with Mongoose?',
        options: ['MongoDB', 'PostgreSQL', 'SQLite', 'Redis only'],
        correctAnswer: 'MongoDB'
    },
    {
        topic: 'Backend Development',
        question: 'What does middleware commonly do in an Express app?',
        options: ['Renders CSS only', 'Runs logic between request and response', 'Replaces MongoDB', 'Compiles React'],
        correctAnswer: 'Runs logic between request and response'
    }
]

function shuffle(items) {
    return [...items]
        .map((item) => ({ item, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ item }) => item)
}

function getWeekNumber(date = new Date()) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000

    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

function getWeekKey(date = new Date()) {
    return `${date.getFullYear()}-W${String(getWeekNumber(date)).padStart(2, '0')}`
}

function serializeQuiz(quiz, extra = {}) {
    return {
        id: quiz._id,
        title: quiz.title,
        weekKey: quiz.weekKey,
        entryFee: quiz.entryFee,
        prizePool: quiz.prizePool,
        durationSeconds: quiz.durationSeconds,
        questionSeconds: quiz.questionSeconds,
        status: quiz.status,
        questionCount: quiz.questions.length,
        startsAt: quiz.startsAt,
        endsAt: quiz.endsAt,
        ...extra
    }
}

function serializeQuestion(question) {
    return {
        id: question._id,
        topic: question.topic,
        question: question.question,
        options: shuffle(question.options)
    }
}

function getAttemptQuestions(quiz, attempt) {
    const questionById = new Map(
        quiz.questions.map((question) => [String(question._id), question])
    )

    return attempt.orderedQuestionIds
        .map((questionId) => questionById.get(String(questionId)))
        .filter(Boolean)
        .map(serializeQuestion)
}

async function ensureWeeklyQuiz() {
    const weekKey = getWeekKey()
    let quiz = await weeklyQuizModel.findOne({ weekKey }).select('+questions.correctAnswer')

    if (!quiz) {
        quiz = await weeklyQuizModel.create({
            weekKey,
            title: `Week ${getWeekNumber()} Tech Quiz`,
            entryFee: 10,
            prizePool: 500,
            durationSeconds: 15 * 60,
            questionSeconds: 20,
            status: 'ready',
            questions: defaultQuestionBank
        })
    }

    return quiz
}

async function getCurrentQuizForUser(user) {
    const quiz = await ensureWeeklyQuiz()
    const latestAttempt = await quizAttemptModel
        .findOne({ quiz: quiz._id, user: user._id })
        .sort({ createdAt: -1 })

    return serializeQuiz(quiz, {
        attemptStatus: latestAttempt?.status || null,
        attemptId: latestAttempt?._id || null,
        canStart: latestAttempt?.status !== 'TERMINATED'
    })
}

async function startAttempt(user, mediaConsent = {}) {
    const quiz = await ensureWeeklyQuiz()

    const terminatedAttempt = await quizAttemptModel.findOne({
        quiz: quiz._id,
        user: user._id,
        status: 'TERMINATED'
    })

    if (terminatedAttempt) {
        const error = new Error('You are suspended from this quiz because the last quiz session was terminated.')
        error.statusCode = 403
        throw error
    }

    let attempt = await quizAttemptModel.findOne({
        quiz: quiz._id,
        user: user._id,
        status: 'IN_PROGRESS'
    })

    if (!attempt) {
        attempt = await quizAttemptModel.create({
            quiz: quiz._id,
            user: user._id,
            orderedQuestionIds: shuffle(quiz.questions).slice(0, 8).map((question) => question._id),
            mediaConsent: {
                camera: Boolean(mediaConsent.camera),
                microphone: Boolean(mediaConsent.microphone)
            }
        })
    }

    return {
        attemptId: attempt._id,
        quiz: serializeQuiz(quiz),
        questions: getAttemptQuestions(quiz, attempt),
        startedAt: attempt.startedAt
    }
}

async function submitAttempt(user, attemptId, submittedAnswers = {}) {
    const attempt = await quizAttemptModel.findOne({
        _id: attemptId,
        user: user._id,
        status: 'IN_PROGRESS'
    })

    if (!attempt) {
        const error = new Error('Active quiz attempt not found.')
        error.statusCode = 404
        throw error
    }

    const quiz = await weeklyQuizModel.findById(attempt.quiz).select('+questions.correctAnswer')
    const questionById = new Map(
        quiz.questions.map((question) => [String(question._id), question])
    )

    const answers = attempt.orderedQuestionIds.map((questionId, index) => {
        const question = questionById.get(String(questionId))
        const selectedOption = submittedAnswers[String(questionId)] ?? submittedAnswers[index] ?? ''
        const isCorrect = Boolean(question && selectedOption === question.correctAnswer)

        return {
            questionId,
            selectedOption,
            isCorrect,
            answeredAt: new Date()
        }
    })

    const score = answers.filter((answer) => answer.isCorrect).length

    attempt.answers = answers
    attempt.score = score
    attempt.earnedCoins = score
    attempt.status = 'SUBMITTED'
    attempt.submittedAt = new Date()
    await attempt.save()

    return {
        attemptId: attempt._id,
        score,
        totalQuestions: answers.length,
        earnedCoins: score,
        answers
    }
}

async function terminateAttempt(user, attemptId, reason, eventType = 'screen_leave') {
    const attempt = await quizAttemptModel.findOne({
        _id: attemptId,
        user: user._id,
        status: 'IN_PROGRESS'
    })

    if (!attempt) {
        return null
    }

    attempt.status = 'TERMINATED'
    attempt.terminatedAt = new Date()
    attempt.terminationReason = reason || 'Quiz terminated due to anti-cheat policy.'
    attempt.antiCheatEvents.push({
        type: eventType,
        message: attempt.terminationReason
    })
    await attempt.save()

    return attempt
}

async function getLeaderboard() {
    const quiz = await ensureWeeklyQuiz()
    const attempts = await quizAttemptModel
        .find({ quiz: quiz._id, status: 'SUBMITTED' })
        .sort({ score: -1, submittedAt: 1 })
        .limit(20)
        .populate('user', 'username email')

    return attempts.map((attempt, index) => ({
        rank: index + 1,
        username: attempt.user?.username || 'Nexora User',
        email: attempt.user?.email || '',
        score: attempt.score,
        earnedCoins: attempt.earnedCoins,
        submittedAt: attempt.submittedAt
    }))
}

module.exports = {
    getCurrentQuizForUser,
    getLeaderboard,
    startAttempt,
    submitAttempt,
    terminateAttempt
}
