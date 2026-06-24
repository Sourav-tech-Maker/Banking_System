const mongoose = require('mongoose')

const kycSchema = new mongoose.Schema({

    UserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: [true, "User ID is required to link KYC data"],
        unique: true
    },

    FullName: {
        type: String,
        required: true,
        trim: true
    },

    dateOfBirth: {
        type: String,
        required: true
    },

    gender: {
        type: String,
        enum: {
            values: ['Male', 'Female', 'Other'],
            message: "Gender must be one of the following: Male, Female, Other"
        },
        required: [true, "Gender is required"]
    },

    permanentAddress: {
        street: {
            type: String,
            required: true,
            trim: true
        },
        city: {
            type: String,
            required: true,
            trim: true
        },
        state: {
            type: String,
            required: true,
            trim: true
        },
        country: {
            type: String,
            required: true,
            trim: true
        },
        postalCode: {
            type: String,
            required: true,
            trim: true
        }
    },
    documentDetails: {
        documentType: {
            type: String,
            enum: {
                values: ['Passport', 'Aadhar-card', 'Driver License', 'Pan-Card'],
                message: "Invalid document type"
            },
            required: [true, "Document type is required"]
        },
        documentNumber: {
            type: String,
            required: [true, "Document Id is required"],
            unique: true,
            trim: true
        },
        documentImg: {
            type: String,
            required: [true, "Document image upload is required"]
        },
    },

    status: {
        type: String,
        enum: {
            values: ['Pending', 'Approve', 'Rejected'],
            message: "Status must be one of the following: Pending, Approve, Rejected,"
        },
        default: 'Pending',
        index: true
    },

    rejectReason: {
        type: String,
        trim: true,
        validator: function (value) {
            if (this.status === 'Rejected') {
                return value && value.trim().length > 0;
            }
            return true;
        },

        message: " 'A rejection reason is required when status is Rejected.'"
    },

    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
    },
    reviewedAt: {
        type: Date,
        default: null
    }

}, { timestamps: true })

kycSchema.index({ userId: 1, status: 1 })
const kycModel = mongoose.model("KYC", kycSchema)
module.exports = kycModel
