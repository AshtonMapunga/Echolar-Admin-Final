// models/company_deregistration.js
const mongoose = require("mongoose");

const PrazregistrationSchema = new mongoose.Schema(
    {
        bankName: {
            type: String,
            required: true,
            trim: true,
        },
        companyEmail: {
            type: String,
            required: true,
            lowercase: true,
            match: [/\S+@\S+\.\S+/, "Invalid email format"],
        },
        accountNumber: {
            type: String,
            required: true,
            trim: true,
        },

        accountHolder: {
            type: String,
            required: true,

        },

        branchCode: {
            type: String,
            required: true,

        },

        accountType: {
            type: String,
            required: true,

        },

        branchName: {
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

const Prazregistration =
    mongoose.models.Prazregistration ||
    mongoose.model("Prazregistration", PrazregistrationSchema);

module.exports = Prazregistration;
