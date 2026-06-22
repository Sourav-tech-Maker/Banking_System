const mongoose = require('mongoose')
const userModel = require('../models/user.model')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const emailService = require('../services/email.service')
const tokenBlackListModel = require('../models/blackList.token.model')

/**
 *  - User Registration Controller
 *  - Post /api/auth/register
 */
async function registerUser(req, res, next) {
    try {
        const { username, email, password, role = 'user' } = req.body

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Username, email, and password are required"
            });
        }

        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!strongPasswordRegex.test(password)) {
            return res.status(422).json({
                error: "Validation Error",
                message: "Password must be at least 8 characters long and contain uppercase, lowercase, a number, and a special character."
            });
        }

        const isUserAlreadyExists = await userModel.findOne({
            $or: [
                { username },
                { email }
            ]
        })
        if (isUserAlreadyExists) {
            return res.status(409).json({
                message: "User already exists",
                status: "failed"
            })
        }

        const user = await userModel.create({
            username,
            email,
            password,
            role
        })

        
        const otp = generateOtp();
        const hashedOtp = hashToken(otp);

        await otpModel.create({
            email,
            otp: hashedOtp,
        });

        const html = getOtpHtml(otp);
        const text = getOtpText(otp);
        await sendEmail(email, "Verify Your Email", text, html);
   
      //token created
        const token = jwt.sign({
            userid: user._id,
            role: user.role,
        }, config.JWT_SECRET, { expiresIn: "3d" })

        // Secure cookies
        res.cookie("token", token)

        res.status(201).json({
            message: "User registered successfully",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        })

        // await emailService.sendRegistrationEmail(user.email, user.username)

    } catch (error) {
        next(error)
    }

}


async function verifyOtp(req, res) {
    try {
        const { email, otp } = req.body || {};

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required",
            });
        }

        const hashedOtp = hashToken(otp);

        const otpRecord = await otpModel.findOne({
            email,
            otp: hashedOtp,
            verified: false,
        });

        if (!otpRecord) {
            return res.status(400).json({
                message: "Invalid or expired OTP",
            });
        }


        if (otpRecord.expiresAt < new Date()) {
            return res.status(400).json({
                message: "OTP has expired. Please request a new one.",
            });
        }
        otpRecord.verified = true;
        await otpRecord.save();

        await userModel.findOneAndUpdate(
            { email },
            { verified: true }
        );

        res.status(200).json({
            message: "Email verified successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

/**
 *  - User Login Controller
 *  - Post /api/auth/login
 */
async function loginUser(req, res, next) {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await userModel.findOne({ email }).select("+password")
        if (!user) {
            return res.status(401).json({
                message: "Email or Password is INVALID"
            })
        }

        const isPasswordValid = await user.comparePassword(password)
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Email or Password is INVALID"
            })
        }

        const token = jwt.sign({
            userid: user._id,
            role: user.role,
        }, process.env.JWT_SECRET, { expiresIn: "3d" })

        // Secure cookies
        res.cookie("token", token, { httpOnly: true }) 
        return res.status(200).json({
            message: "User logged-in successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        })
    } catch (error) {
        next(error)
    }
}

/**
 *  - User Logout Controller
 *  - Post /api/auth/logout
 */
async function logoutUser(req, res) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]
    // here why 
    if(!token){
        return res.status(400).json({
            message: "Token Not Found"
        })
    }
    res.cookie("token", "")
    await tokenBlackListModel.create({ token })  
    return res.status(200).json({
        message: "User logged out successfully"
    })
}

module.exports = { registerUser, loginUser, logoutUser }
