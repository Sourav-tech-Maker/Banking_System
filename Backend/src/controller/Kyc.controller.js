const mongoose = require('mongoose')
const config = require('../config/config')
const kycModel = require('../models/kyc.models')
const accountModel = require('../models/account.model')


async function registerKyc(req, res, next) {

    try {
        const { UserId, FullName, dateOfBirth, gender, permanentAddress, documentDetails} = req.body || {} 
        if(!UserId || !FullName || !dateOfBirth || !gender || !permanentAddress || !documentDetails){
            return res.status(400).json({
                message: "All Field are required for register Kyc",
                status: "failed"
            })
        }
        const user = req.body
        const fetchDetails = await accountModel.findOne({user: UserId})

        if(!fetchDetails){
            return res.status(404).json({
                message: "Account not found, you must register an account first",
                status: false
            })
        }

        if(fetchDetails.status !== 'Active'){
            return res.status(403).json({
                message: `Your account exists, but Your current account status is: ${fetchDetails.status}`,
                status: false
            })
        }

        const fetchKyc = await kycModel.findOne({ UserId });
        if(fetchKyc){
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
            documentDetails
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


module.exports = { registerKyc }
