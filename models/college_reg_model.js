// models/college_registration.js
const mongoose = require("mongoose");

const CollegeRegistrationSchema = new mongoose.Schema(
    {
        applicantName: {
            type: String,
            required: true,
            trim: true,
        },
        churchName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            match: [/\S+@\S+\.\S+/, "Invalid email format"],
        },
        phoneNumber: {
            type: String,
            required: true,
            trim: true,
        },
        whatsappNumber: {
            type: String,
            required: true,
            trim: true,
        },
        serviceType: {
            type: String,
            default: "College Registration",
        },
        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending",
        },
        applicationDate: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const CollegeRegistration =
    mongoose.models.CollegeRegistration ||
    mongoose.model("CollegeRegistration", CollegeRegistrationSchema);

module.exports = CollegeRegistration;