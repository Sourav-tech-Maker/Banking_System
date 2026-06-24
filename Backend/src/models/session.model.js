const mongoose =  require('mongoose');

const sessionSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "user",
        required:[true, "User is required"],
        index: true
    },
    refreshTokenHash:{
        type: String,
        required: [true, "Refresh token hash is required"],
        unique: true
    },
    ip:{
        type:String,
        required: [true, "IP address is required"],
        trim: true
    },
    userAgent:{
        type:String ,
        required: [true, "User agent is required"],
        trim: true
    },
    revoked:{
        type:Boolean,
        default: false,
        index: true
    },
    expiresAt: {
        type: Date,
        required: true
    }

}, {
    timestamps: true,
})


sessionSchema.index({expiresAt: 1}, {expireAfterSeconds: 0})
const sessionModel = mongoose.model("session", sessionSchema)

module.exports =  sessionModel
