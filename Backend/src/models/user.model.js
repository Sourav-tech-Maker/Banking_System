const mongoose = require('mongoose')
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        index: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    email: {
        type: String,
        required: [true, "Email is required for creating user"],
        trim: true,
        lowercase: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please provide valid email address'],
        unique: true
    },

    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, "Password should contain at least 6 characters"],
        select: false,
    },

    verified: {
        type: Boolean,
        default: false
    },

    status: {
        type: String,
        default: "Active"
    },

    role: {
        type: String,
        enum: ['user', 'admin', 'systemUser'],
        default: 'user',
        index: true
    },

    kyc: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "KYC",
        default: null
    },

    systemUser: {
        type: Boolean,
        default: false,
        immutable: true,
        select: false
    },

    loginAttempts: {
        type: Number,
        default: 0
    },

    lockUntil: {
        type: Date
    }
}, {
    timestamps: true
})

userSchema.pre('save', async function () {

    if (!this.userId) {
        this.userId = this._id;
    }
    this.systemUser = this.role === 'systemUser';
    if (!this.isModified("password")) {
        return;
    }
    this.password = await bcrypt.hash(this.password, 10);
})

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

const userModel = mongoose.model("user", userSchema);
module.exports = userModel;
