const GoalModel = require('../models/Goals.model');
const SavingsModel = require('../models/saving.model');

async function createGoal(req, res, next) {
    try {
        const userId = req.user._id;
        const { title, category, targetAmount, currentAmount, targetDate } = req.body;

        if (!title || !category || targetAmount == null || !targetDate) {
            return res.status(400).json({
                message: "All fields are required (title, category, targetAmount, targetDate)."
            });
        }

        const isGoalAlreadyExists = await GoalModel.findOne({
            userId,
            title
        });

        if (isGoalAlreadyExists) {
            return res.status(409).json({
                message: "Goal with this title already exists."
            });
        }

        if (targetAmount <= 0) {
            return res.status(400).json({
                message: "Target amount must be greater than 0."
            });
        }

        const initialAmount = currentAmount != null ? Number(currentAmount) : 0;
        if (initialAmount < 0) {
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
            currentAmount: initialAmount,
            targetDate,
        });

        // this is to create a savings log entry if the initial amount is greater than 0
        if (initialAmount > 0) {
            await SavingsModel.create({
                goalId: goal._id,
                amountAdded: initialAmount,
                type: 'manual'
            });
        }

        return res.status(201).json({
            success: true,
            message: "Goal created successfully.",
            goal: goal.toObject({ virtuals: true })
        });
    } catch (error) {
        next(error);
    }
}

async function getGoals(req, res, next) {
    try {
        const userId = req.user._id;
        const goals = await GoalModel.find({ userId });
        
        // Include virtual properties in response (remainingAmount, progressPercentage)
        const goalsWithVirtuals = goals.map(goal => {
            return goal.toObject({ virtuals: true });
        });

        return res.status(200).json({
            success: true,
            goals: goalsWithVirtuals
        });
    } catch (error) {
        next(error);
    }
}

async function addAmount(req, res, next) {
    try {
        const userId = req.user._id;
        const { goalId, amount, type } = req.body;

        if (!goalId || amount == null) {
            return res.status(400).json({
                message: "Goal ID and amount are required."
            });
        }

        const amountToAdd = Number(amount);
        if (isNaN(amountToAdd) || amountToAdd <= 0) {
            return res.status(400).json({
                message: "Amount must be a positive number greater than 0."
            });
        }

        const goal = await GoalModel.findOne({ _id: goalId, userId });
        if (!goal) {
            return res.status(404).json({
                message: "Goal not found."
            });
        }

        goal.currentAmount += amountToAdd;
        await goal.save();

        const savingsLog = await SavingsModel.create({
            goalId: goal._id,
            amountAdded: amountToAdd,
            type: type || 'manual'
        });

        return res.status(200).json({
            success: true,
            message: `Successfully added ${amountToAdd} to the goal.`,
            goal: goal.toObject({ virtuals: true }),
            savingsLog
        });
    } catch (error) {
        next(error);
    }
}

async function getGoalHistory(req, res, next) {
    try {
        const userId = req.user._id;
        const { goalId } = req.params;

        const goal = await GoalModel.findOne({ _id: goalId, userId });
        if (!goal) {
            return res.status(404).json({
                message: "Goal not found."
            });
        }

        const logs = await SavingsModel.find({ goalId }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            history: logs
        });
    } catch (error) {
        next(error);
    }
}

async function deleteGoal(req, res, next) {
    try {
        const userId = req.user._id;
        const { goalId } = req.params;

        const goal = await GoalModel.findOneAndDelete({ _id: goalId, userId });
        if (!goal) {
            return res.status(404).json({
                message: "Goal not found."
            });
        }

        await SavingsModel.deleteMany({ goalId });

        return res.status(200).json({
            success: true,
            message: "Goal deleted successfully."
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createGoal,
    getGoals,
    addAmount,
    getGoalHistory,
    deleteGoal
};
