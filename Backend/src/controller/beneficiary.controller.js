const mongoose = require('mongoose');
const beneficiaryModel = require('../models/beneficiary.model');
const accountModel = require('../models/account.model');
const { sendEmail } = require('../services/email.service');
const { generateOtp, getOtpHtml, getOtpText } = require('../Utils/otp.utils')

async function addBeneficiaries(req, res) {
    try {
        const currentLoggedInUserId = req.user._id;
        const { fullName, nickName, accountId } = req.body || {};

        if (!fullName || !nickName || !accountId) {
            return res.status(400).json({
                message: "All fields are required",
                status: "failed"
            });
        }

        const targetAccount = await accountModel.findById(accountId);
        if (!targetAccount) {
            return res.status(404).json({
                message: "The beneficiary account does not exist.",
                status: "failed"
            });
        }

        if (!targetAccount.isKycVerified) {
            return res.status(400).json({
                message: "You cannot add this beneficiary because their KYC is not verified.",
                status: "failed"
            });
        }

        if (targetAccount.status !== "Active") {
            return res.status(400).json({
                message: "You cannot add this beneficiary because the account is not ACTIVE",
                status: "failed"
            });
        }

        if (targetAccount.user.equals(currentLoggedInUserId)) {
            return res.status(400).json({
                message: "You cannot add your own account as a beneficiary.",
                status: "failed"
            });
        }

        const isAlreadyAdded = await beneficiaryModel.findOne({ userId: currentLoggedInUserId, accountId });
        if (isAlreadyAdded) {
            return res.status(409).json({
                message: "This beneficiary is already added to your list.",
                status: "failed"
            });
        }

        const otp = generateOtp();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        


        const beneficiary = await beneficiaryModel.create({
           userId: currentLoggedInUserId, 
            fullName,
            nickName,
            accountId,
            otp,
            otpExpiresAt,
            isVerified: false
        });

        const html = getOtpHtml(otp);
        const text = getOtpText(otp);
        await sendEmail(req.user.email, "Verify Your Beneficiary Setup", text, html);

        return res.status(201).json({
            message: "Beneficiary registration initiated. OTP sent to email.",
            status: "success",
            data: {
                beneficiaryId: beneficiary._id,
                isVerified: false
            }
        });
    } catch (error) {
        console.error("Error adding beneficiary:", error);
        return res.status(500).json({
            message: "Internal server error",
            status: "error"
        });
    }
}

async function verifyBeneficiary(req, res) {
    try {
        const { beneficiaryId, otp } = req.body;

        if (!beneficiaryId || !otp) {
            return res.status(400).json({
                message: "Please provide both beneficiaryId and OTP"
            });
        }


        const beneficiary = await beneficiaryModel.findById(beneficiaryId);

        if (!beneficiary) {
            return res.status(404).json({
                message: "Beneficiary assignment log not found"
            });
        }
        if (String(beneficiary.otp) !== String(otp)) {
            return res.status(400).json({
                message: "Invalid OTP code provided."
            });
        }

        if (!beneficiary.otpExpiresAt || new Date() > beneficiary.otpExpiresAt) {
            return res.status(400).json({
                message: "OTP has expired. Please re-initiate beneficiary setup."
            });
        }


        beneficiary.isVerified = true;
        beneficiary.otp = null;
        beneficiary.otpExpiresAt = null;

        await beneficiary.save();

        return res.status(200).json({
            message: "Beneficiary verified and activated successfully"
        });
    } catch (error) {
        console.error("Error verifying beneficiary:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

async function getBeneficiaries(req, res) {
    try {
        const userId = req.user._id;

        const beneficiariesList = await beneficiaryModel.find({ userId, isVerified: true }).populate({
            path: 'accountId',
            select: 'accountType status currency'
        });

        return res.status(200).json({
            status: "success",
            results: beneficiariesList.length,
            data: {
                beneficiaries: beneficiariesList
            }
        });
    } catch (error) {
        console.error("Error inside getBeneficiaries:", error);
        return res.status(500).json({
            message: "Something went wrong during retrieval.",
            status: "error"
        });
    }
}

async function deleteBeneficiary(req, res) {
    try {
        const { beneficiaryId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(beneficiaryId)) {
            return res.status(400).json({
                message: "Invalid beneficiary ID",
                status: "failed"
            });
        }

        const deletedBeneficiary = await beneficiaryModel.findOneAndDelete({
            _id: beneficiaryId,
            userId: req.user._id
        });

        if (!deletedBeneficiary) {
            return res.status(404).json({
                message: "Beneficiary not found",
                status: "failed"
            });
        }

        return res.status(200).json({
            message: "Beneficiary removed successfully",
            status: "success",
            data: {
                beneficiaryId: deletedBeneficiary._id
            }
        });
    } catch (error) {
        console.error("Error deleting beneficiary:", error);
        return res.status(500).json({
            message: "Something went wrong while removing the beneficiary.",
            status: "error"
        });
    }
}

module.exports = {
    addBeneficiaries,
    verifyBeneficiary,
    getBeneficiaries,
    deleteBeneficiary
};
