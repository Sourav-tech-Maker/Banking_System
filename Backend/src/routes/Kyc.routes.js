const express = require('express')
const multer = require('multer')
const Kyc = require('../controller/Kyc.controller')
const authmiddleware = require('../middleware/auth.middleware')
const { dbWriteLimiter } = require('../middleware/rateLimiter.middleware')
const Router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!allowedImageTypes.includes(file.mimetype)) {
            return cb(new Error("Only JPG, PNG, or WEBP document images are allowed."));
        }

        return cb(null, true);
    }
});

const uploadKycDocument = (req, res, next) => {
    upload.single("documentImg")(req, res, (error) => {
        if (!error) {
            return next();
        }

        const message = error.code === "LIMIT_FILE_SIZE"
            ? "Document image must be 5MB or less."
            : error.message;

        return res.status(400).json({
            message,
            status: "failed"
        });
    });
};

// POST /api/Kyc/register-kyc
Router.post('/register-kyc', authmiddleware, dbWriteLimiter, uploadKycDocument, Kyc.registerKyc)
// POST /api/Kyc/verify-kyc
Router.post('/verify-kyc', dbWriteLimiter, Kyc.verifyKyc)
module.exports = Router
