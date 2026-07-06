const GoalModel = require('../models/Goals.model');
const transactionModel = require('../models/transaction.model');

async function createGoal(req, res, next) {

    try {

        const userId = req.user._id;
        const { title, category, targetAmount, currentAmount, targetDate } = req.body

        if (!userId || !title || !category || targetAmount == null || currentAmount == null || !targetDate) {
            return res.status(400).json({
                message: "All fields are required to fill.."
            })
        }

        const isGoalAlreadyExists = await GoalModel.findOne({

            userId,
            title

        })

        if (isGoalAlreadyExists) {
            return res.status(409).json({
                message: " Goal with this title already exists..."
            })
        }

        if (targetAmount <= 0) {
            return res.status(400).json({
                message: "Target amount must be greater than 0."
            });
        }

        if (currentAmount < 0) {
            return res.status(400).json({
                message: "Current amount cannot be negative."
            });
        }

        if (new Date(targetDate) <= new Date()) {
            return res.status(400).json({
                message: "Target date must be in the future."
            });
        }

        const goal = await GoalModel.create({
            userId,
            title,
            category,
            targetAmount,
            currentAmount,
            targetDate,
        })


        return res.status(201).json({
            success: true,
            message: "Goal created successfully.",
            goal
        });



    } catch (error) {
        next(error)
    }
}


async function AddAmount(req, res, next) {

    const {goalId, amount} = req.body
    if(!goalId || !amount){
        return res.status(400).json({
            message: ""
        })
    }
}


module.exports = createGoal
