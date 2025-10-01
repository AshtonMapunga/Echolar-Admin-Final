// models/company_deregistration.js
const mongoose = require("mongoose");

const LicenceSchema = new mongoose.Schema(
    {
        companyName: {
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
        address: {
            type: String,
            required: true,
            trim: true,
        },

        contactPerson: {
            type: String,
            required: true,

        },

        phoneNumber: {
            type: String,
            required: true,

        },


        businessType: {
            type: String,
            required: true,

        }, premisesSize: {
            type: String,
            required: true,

        }, targetMarket: {
            type: String,
            required: true,

        },
        status: {
            type: String,
            enum: [
                "Pending",
                "Approved",
                "Rejected",

            ],
            default: "Pending",
        },



    },
    {
        timestamps: true,
    }
);

const Licenceregistration =
    mongoose.models.Licenceregistration ||
    mongoose.model("Licenceregistration", LicenceSchema);

module.exports = Licenceregistration;
