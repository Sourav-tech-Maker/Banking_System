const express = require('express')
const authMiddleware = require('../middleware/auth.middleware')
const quizController = require('../controller/quiz.controller')

const router = express.Router()

router.get('/weekly', authMiddleware, quizController.getCurrentQuiz)
router.post('/start', authMiddleware, quizController.startQuiz)
router.post('/submit', authMiddleware, quizController.submitQuiz)
router.post('/terminate', authMiddleware, quizController.terminateQuiz)
router.get('/leaderboard', authMiddleware, quizController.getLeaderboard)

module.exports = router
