const userModel = require('../models/user.model')
const  config  = require('../config/config')
const jwt = require('jsonwebtoken')


async function authmiddleware(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized access, token is missing"
        })
    }

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET)
        const user = await userModel.findById(decoded.userid)

        if (!user) {
            return res.status(401).json({
                message: "Unauthorized access, user not found"
            })
        }

        req.user = user

        return next()

    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized access, token is invalid"
        })
    }
}


async function authSystemUserMiddleware(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized access, token is missing"
        })
    }

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET)
        const user = await userModel.findById(decoded.userid).select("+systemUser")
        if (!user.systemUser) {
            return res.status(403).json({
                message: "Forbidden accecss, not a system user"
            })
        }
        req.user = user
        return next()
    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized access, token is invalid"
        })
    }
}

async function adminMiddleware(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            message: "Forbidden access, admin privilege required"
        })
    }
    return next()
}

module.exports = authmiddleware;
module.exports.authSystemUserMiddleware = authSystemUserMiddleware;
module.exports.adminMiddleware = adminMiddleware;
