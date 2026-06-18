const mongoose = require('mongoose')

const tokenBlackListSchema = new mongoose.Schema({

    token:{
        type:String,
        required: [true, "Token is required to blacklist"],
        unique: [true, "Token is already blacklisted "]
    }
}, {
    timestamps: true,
    expires: 60 * 60 * 24 // expire after 24 hours
})

tokenBlackListSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 })

const tokenBlackListModel = mongoose.model('TokenBlackList', tokenBlackListSchema)

module.exports = tokenBlackListModel
