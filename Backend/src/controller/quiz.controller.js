const quizService = require('../services/quiz.service')

async function getCurrentQuiz(req, res, next) {
    try {
        const quiz = await quizService.getCurrentQuizForUser(req.user)
        return res.status(200).json({ quiz })
    } catch (error) {
        next(error)
    }
}

async function startQuiz(req, res, next) {
    try {
        const attempt = await quizService.startAttempt(req.user, req.body?.mediaConsent)
        return res.status(201).json(attempt)
    } catch (error) {
        next(error)
    }
}

async function submitQuiz(req, res, next) {
    try {
        const { attemptId, answers } = req.body

        if (!attemptId) {
            return res.status(400).json({
                message: 'attemptId is required.'
            })
        }

        const result = await quizService.submitAttempt(req.user, attemptId, answers || {})
        return res.status(200).json(result)
    } catch (error) {
        next(error)
    }
}

async function terminateQuiz(req, res, next) {
    try {
        const { attemptId, reason, eventType } = req.body

        if (!attemptId) {
            return res.status(400).json({
                message: 'attemptId is required.'
            })
        }

        const attempt = await quizService.terminateAttempt(req.user, attemptId, reason, eventType)

        return res.status(200).json({
            message: attempt ? 'Quiz attempt terminated.' : 'No active quiz attempt found.'
        })
    } catch (error) {
        next(error)
    }
}

async function getLeaderboard(req, res, next) {
    try {
        const leaderboard = await quizService.getLeaderboard()
        return res.status(200).json({ leaderboard })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getCurrentQuiz,
    getLeaderboard,
    startQuiz,
    submitQuiz,
    terminateQuiz
}
