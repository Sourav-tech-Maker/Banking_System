const mongoose = require('mongoose');
const beneficiaryModel = require('../models/beneficiary.model');
const accountModel = require('../models/account.model');
const { sendEmail } = require('../services/email.service');
const { generateOtp, getOtpHtml, getOtpText} = require('../Utils/otp.utils')

async function addBeneficiaries(req, res) {
    try {
        const { fullName, nickName, accountId, email } = req.body || {}; 
        const userId = req.user.id;

        if (!userId || !fullName || !nickName || !accountId || !email) {
            return res.status(400).json({
                message: "All fields are required",
                status: "failed"
            });
        }

        const targetAccount = await accountModel.findById(accountId);
        if (!targetAccount){
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

        if (targetAccount.user.equals(userId)) {
            return res.status(400).json({
                message: "You cannot add your own account as a beneficiary.",
                status: "failed"
            });
        }

        const isAlreadyAdded = await beneficiaryModel.findOne({ userId, accountId });
        if (isAlreadyAdded) {
            return res.status(409).json({
                message: "This beneficiary is already added to your list.",
                status: "failed"
            });
        }

        const otp = generateOtp();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000); 

        
        const beneficiary = await beneficiaryModel.create({
            userId,
            fullName,
            nickName,
            accountId,
            otp, 
            otpExpires,
            isVerified: false
        });
        
        const html = getOtpHtml(otp);
        const text = getOtpText(otp);
        await sendEmail(email, "Verify Your Beneficiary Setup", text, html);

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
            status: "error",
            message: "Internal server error"
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

       
        if (beneficiary.otp !== otp) {
            return res.status(400).json({
                message: "Invalid OTP code provided."
            });
        }

        
        if (new Date() > beneficiary.otpExpires) {
            return res.status(400).json({
                message: "OTP has expired. Please re-initiate beneficiary setup."
            });
        }

        
        beneficiary.isVerified = true;
        beneficiary.otp = null; 
        beneficiary.otpExpires = null;

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
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({
                message: "User ID is required to fetch beneficiaries.",
                status: "failed"
            });
        }
        
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

module.exports = {
    addBeneficiaries,
    verifyBeneficiary,
    getBeneficiaries
};
