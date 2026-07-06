const mongoose = require('mongoose')
const crypto = require('crypto')
const userModel = require('../models/user.model')
const sessionModel = require('../models/session.model')
const config = require('../config/config')
const otpModel = require('../models/otp.model')
const jwt = require('jsonwebtoken')
const { sendEmail, sendNewDeviceLoginEmail, sendRegistrationEmail } = require('../services/email.service')
const tokenBlackListModel = require('../models/blackList.token.model')
const { generateOtp, getOtpHtml, getOtpText } = require('../Utils/otp.utils')

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

/**
 *  - User Registration Controller
 *  - Post /api/auth/register
 */
async function registerUser(req, res, next) {
    try {
        const { username, email, password, role = 'user', roleAccessKey } = req.body
        const allowedRoles = ['user', 'admin', 'systemUser']
        const requestedRole = allowedRoles.includes(role) ? role : 'user'

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Username, email, and password are required"
            });
        }

        if (requestedRole !== 'user') {
            const rbacRegistrationKey = config.RBAC_REGISTRATION_KEY

            if (!rbacRegistrationKey || roleAccessKey !== rbacRegistrationKey) {
                return res.status(403).json({
                    message: "A valid RBAC registration key is required for admin or system user registration."
                })
            }
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
            role: requestedRole
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



        res.status(201).json({
            message: "User registered successfully",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        })
        try {
            await sendRegistrationEmail(user.email, user.username)
        } catch (emailError) {
            console.error("Background welcome email failed to send:", emailError);
        }


    } catch (error) {
        console.error("Register Error:", error);
        next(error)
    }

}

/**
 * - Verify OTP Controller
 * - POST /api/auth/verify-otp
 */
async function verifyOtp(req, res, next) {
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
        console.error("OTP Verification Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
        next(error)
    }
}

/**
 *  - User Login Controller
 *  - Post /api/auth/login
 */
async function loginUser(req, res, next) {
    try {
        const { email, password, role, roleAccessKey } = req.body
        const allowedRoles = ['user', 'admin', 'systemUser']
        const requestedRole = allowedRoles.includes(role) ? role : 'user'

        if (!email || !password || (requestedRole !== 'user' && !roleAccessKey)) {
            return res.status(400).json({
                message: "Email, password, and RoleAccessKey are required"
            });
        }

        const user = await userModel.findOne({ email }).select("+password +systemUser ")
        if (!user) {
            return res.status(401).json({
                message: "Email or Password is INVALID"
            })
        }

        if (!user.verified) {
            return res.status(403).json({
                message: "Please verify your email before logging in."
            })
        }

        if (user.status !== "Active") {
            return res.status(403).json({
                message: "Your account is not active."
            })
        }

        if (
            user.lockUntil &&
            user.lockUntil > Date.now()
        ) {
            return res.status(403).json({
                message:
                    "Account temporarily locked. Try again later."
            });
        }

        const isPasswordValid = await user.comparePassword(password)
        if (!isPasswordValid) {
            user.loginAttempts += 1;

            if (user.loginAttempts >= 5) {
                user.lockUntil = Date.now() + 15 * 60 * 1000;
                user.loginAttempts = 0;
            }
            await user.save()
            return res.status(401).json({
                message: "Email or Password is INVALID"
            })
        }

        let actualRole = user.role;
        if (user.systemUser === true || user.system_user === true || user.role === 'systemUser') {
            actualRole = 'systemUser';
        }
         
        if (actualRole !== requestedRole) {
            return res.status(403).json({
                message: "Selected role does not match this account."
            });
        }

        if (requestedRole === 'admin' || requestedRole === 'systemUser') {
            const rbacRegistrationKey = config.RBAC_REGISTRATION_KEY

            if (!rbacRegistrationKey || roleAccessKey !== rbacRegistrationKey) {
                return res.status(403).json({
                    message: "A valid RBAC registration key is required for admin or system user Login."
                })
            }
        }

        user.loginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();

        const accessToken = jwt.sign({
            userid: user._id,
            role: actualRole,
        }, config.JWT_SECRET, { expiresIn: "15m" })

        const refreshToken = jwt.sign({
            userid: user._id
        }, config.JWT_SECRET, { expiresIn: "7d" })

        const hashedRefreshToken = hashToken(refreshToken)
        const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

        const existingSession = await sessionModel.findOne({
            user: user._id,
            userAgent: req.headers["user-agent"]
        });

        if (!existingSession) {
            await sendNewDeviceLoginEmail(user.email, user.username);
        }

        await sessionModel.create({
            user: user._id,
            refreshTokenHash: hashedRefreshToken,
            ip: req.ip || req.headers['x-forwarded-for'] || "127.0.0.1",
            userAgent: req.headers['user-agent'] || "Unknown Device",
            expiresAt: sessionExpiry
        })
        
        res.cookie("token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000 // 15 minutes (matches JWT expiry)
        })
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        return res.status(200).json({
            message: "User logged-in successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            accessToken
        })
    } catch (error) {
        next(error)
    }
}


/**
 * - Silent Token Refresh Controller
 * - POST /api/auth/refresh-token
 */

async function refreshAccessToken(req, res, next) {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token is missing" });
        }

        const hashedRefreshToken = hashToken(refreshToken);
        const session = await sessionModel.findOne({ refreshTokenHash: hashedRefreshToken, revoked: false });

        if (!session || session.expiresAt < new Date()) {
            return res.status(401).json({ message: "Session expired or invalid" });
        }

        const decoded = jwt.verify(refreshToken, config.JWT_SECRET);
        const user = await userModel.findById(decoded.userid).select("+systemUser +system_user");

        if (!user || user.status !== "Active") {
            return res.status(401).json({ message: "User account unavailable" });
        }

        let actualRole = user.role;
        if (user.systemUser === true || user.role === 'systemUser') {
            actualRole = 'systemUser';
        }

        const newAccessToken = jwt.sign({
            userid: user._id,
            role: actualRole,
        }, config.JWT_SECRET, { expiresIn: "15m" });

        res.cookie("token", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000
        });

        return res.status(200).json({
            message: "Token rotated successfully",
            accessToken: newAccessToken
        });
    } catch (error) {
        return res.status(401).json({ message: "Session verification failed" });
    }
}

/**
 *  - User Logout Controller
 *  - Post /api/auth/logout
 */
async function logoutUser(req, res, next) {

    try {
        const refreshToken = req.cookies.refreshToken
        if (!refreshToken) {
            return res.status(400).json({
                message: "Token Not Found"
            })
        }
        const hashedRefreshToken = hashToken(refreshToken)
        await sessionModel.findOneAndUpdate(
            { refreshTokenHash: hashedRefreshToken, revoked: false },
            {
                revoked: true,
                revokedAt: new Date()
            }
        )

        const accessToken = req.cookies.token || req.headers.authorization?.split(" ")[1]
        if (accessToken) {
            await tokenBlackListModel.create({ token: accessToken })
        }

        res.clearCookie("refreshToken"),
            res.clearCookie("token")

        return res.status(200).json({
            message: "User logged out successfully"
        })
    } catch (error) {
        next(error)
    }
}

module.exports = { registerUser, verifyOtp, loginUser, refreshAccessToken, logoutUser }
