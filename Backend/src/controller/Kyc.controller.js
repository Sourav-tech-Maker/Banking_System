const mongoose = require('mongoose')
const config = require('../config/config')
const kycModel = require('../models/kyc.models')
const userModel = require('../models/user.model')
const accountModel = require('../models/account.model')


async function registerKyc(req, res, next) {

    try {
        const { UserId, FullName, dateOfBirth, gender, permanentAddress, documentDetails } = req.body || {}
        if (!UserId || !FullName || !dateOfBirth || !gender || !permanentAddress || !documentDetails) {
            return res.status(400).json({
                message: "All Field are required for register Kyc",
                status: "failed"
            })
        }
        const user = req.body
        const fetchDetails = await userModel.findOne({ user: user._id })

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

        const Kyc = await kycModel.create({
            UserId,
            FullName,
            dateOfBirth,
            gender,
            permanentAddress,
            documentDetails,
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
