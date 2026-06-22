const jwt = require('jsonwebtoken');
const  crypto = require('crypto');
const  config = require('../config/config.js');

 function generateAccessToken(payload) {
    return jwt.sign(payload, config.JWT_SECRET, { expiresIn: "1d" });
}

 function generateRefreshToken(payload) {
    return jwt.sign(payload, config.JWT_SECRET, { expiresIn: "7d" });
}

 function verifyToken(token) {
    return jwt.verify(token, config.JWT_SECRET);
}

 function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}


 function hashPassword(password) {
    return crypto.createHash("sha256").update(password).digest("hex");
}

 function setRefreshTokenCookie(res, refreshToken) {
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
}
module.exports = {
    generateAccessToken,  generateRefreshToken,
    verifyToken,
    hashToken,
    hashPassword,
    setRefreshTokenCookie
};
