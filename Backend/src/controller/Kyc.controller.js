const mongoose = require('mongoose')
const config = require('../config/config')
const kycModel = require('../models/kyc.models')
const userModel = require('../models/user.model')
const accountModel = require('../models/account.model')
const { Blob } = require('buffer')

const IMAGEKIT_UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";
const MAX_DOCUMENT_IMAGE_SIZE = 5 * 1024 * 1024;

function parsePermanentAddress(permanentAddress) {
    if (typeof permanentAddress !== "string") {
        return permanentAddress;
    }

    try {
        return JSON.parse(permanentAddress);
    } catch (error) {
        return null;
    }
}

function hasCompleteAddress(permanentAddress) {
    return Boolean(
        permanentAddress &&
        permanentAddress.street &&
        permanentAddress.city &&
        permanentAddress.state &&
        permanentAddress.country &&
        permanentAddress.postalCode
    );
}

function sanitizeFileName(fileName = "document-image") {
    return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

async function uploadDocumentImageToImageKit(file, userId) {
    if (!config.IMAGEKIT_PRIVATE_KEY) {
        const error = new Error("ImageKit private key is not configured on the server.");
        error.statusCode = 500;
        throw error;
    }

    if (!file) {
        return null;
    }

    if (file.size > MAX_DOCUMENT_IMAGE_SIZE) {
        const error = new Error("Document image must be 5MB or less.");
        error.statusCode = 400;
        throw error;
    }

    const uploadFormData = new FormData();
    const safeOriginalName = sanitizeFileName(file.originalname);
    const uploadFileName = `kyc-${userId}-${Date.now()}-${safeOriginalName}`;

    uploadFormData.append("file", new Blob([file.buffer], { type: file.mimetype }), safeOriginalName);
    uploadFormData.append("fileName", uploadFileName);
    uploadFormData.append("folder", config.IMAGEKIT_KYC_FOLDER);
    uploadFormData.append("useUniqueFileName", "true");

    const authHeader = Buffer.from(`${config.IMAGEKIT_PRIVATE_KEY}:`).toString("base64");
    const response = await fetch(IMAGEKIT_UPLOAD_URL, {
        method: "POST",
        headers: {
            Authorization: `Basic ${authHeader}`
        },
        body: uploadFormData
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const error = new Error(data.message || "Failed to upload document image to ImageKit.");
        error.statusCode = 502;
        throw error;
    }

    if (!data.url) {
        const error = new Error("ImageKit upload succeeded but did not return an image URL.");
        error.statusCode = 502;
        throw error;
    }

    return data.url;
}



async function registerKyc(req, res, next) {

    try {
        let { FullName, dateOfBirth, gender, permanentAddress, documentType, documentNumber, documentImg } = req.body || {}
        permanentAddress = parsePermanentAddress(permanentAddress);
        const UserId = req.user._id;
        if (!FullName || !dateOfBirth || !gender || !hasCompleteAddress(permanentAddress) || !documentType || !documentNumber || (!documentImg && !req.file)) {
            return res.status(400).json({
                message: "All Field are required for register Kyc",
                status: "failed"
            })
        }

        const fetchDetails = await userModel.findById(UserId)

        if (!fetchDetails) {
            return res.status(404).json({
                message: "User not found, you must register an user account first",
                status: false
            })
        }

        if (fetchDetails.verified !== true) {
            return res.status(403).json({
                message: `Your registration account exists, but Your current  verify status is: ${fetchDetails.verified}`,
                status: false
            })
        }

        const fetchKyc = await kycModel.findOne({ UserId });
        if (fetchKyc) {
            return res.status(409).json({
                message: "Kyc Already submitted..",
                status: false
            })
        }

        if (req.file) {
            documentImg = await uploadDocumentImageToImageKit(req.file, UserId);
        }

        const Kyc = await kycModel.create({
            UserId,
            FullName,
            dateOfBirth,
            gender,
            permanentAddress,
            documentType,
            documentNumber,
            documentImg,
            status: "Pending"
        })

        fetchDetails.kyc = Kyc._id
        await fetchDetails.save()

        return res.status(201).json({
            message: "Kyc is successfully registered...",
            status: 'Pending'
        })

    } catch (error) {
        next(error)
    }
}



/**
 * 2. VERIFY KYC (Admin Review Endpoint using UserId)
 * POST /api/kyc/verify
 */
async function verifyKyc(req, res, next) {
    try {
        const { UserId, status, rejectReason } = req.body || {};

        if (!UserId || !status) {
            return res.status(400).json({
                message: "User ID and status action (Approve/Rejected) are required.",
                status: "failed"
            });
        }

        if (!['Approve', 'Rejected'].includes(status)) {
            return res.status(400).json({
                message: "Invalid status action. Must be 'Approve' or 'Rejected'.",
                status: "failed"
            });
        }

        const kycRecord = await kycModel.findOne({ UserId });
        if (!kycRecord) {
            return res.status(404).json({
                message: "KYC record not found for this user.",
                status: "failed"
            });
        }

        if (status === 'Rejected') {
            if (!rejectReason) {
                return res.status(400).json({
                    message: "A rejection reason is required to reject KYC.",
                    status: "failed"
                });
            }

            kycRecord.status = 'Rejected';
            kycRecord.rejectReason = rejectReason;
            await kycRecord.save();

            return res.status(200).json({
                message: "KYC application has been rejected.",
                status: "success"
            });
        }

        kycRecord.status = 'Approve';
        kycRecord.rejectReason = null;
        await kycRecord.save();

        await accountModel.findOneAndUpdate(
            { user: UserId },
            { isKycVerified: true }
        );

        return res.status(200).json({
            message: "KYC application approved successfully. Bank account activated for transactions.",
            status: "success"
        });

    } catch (error) {
        next(error);
    }
}

module.exports = { registerKyc, verifyKyc }
