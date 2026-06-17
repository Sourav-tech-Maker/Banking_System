const mongoose = require('mongoose')
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
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
        unique: [true, "Email already exists"]
    },
    
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, "Password should contain at least 6 characters"],
        select: false,
    },

    systemUser: {
        type: Boolean,
        default: false,
        immutable: true,
        select: false
    }
}, {
    timestamps: true
})

userSchema.pre('save', async function(){
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
