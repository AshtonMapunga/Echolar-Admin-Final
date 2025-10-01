// models/company_deregistration.js
const mongoose = require("mongoose");

const VendorNumberregistrationSchema = new mongoose.Schema(
    {
        applicantName: {
            type: String,
            required: true,
            trim: true,
        },
        applicantEmail: {
            type: String,
            required: true,
            lowercase: true,
            match: [/\S+@\S+\.\S+/, "Invalid email format"],
        },
        applicantPhoneNumber: {
            type: String,
            required: true,
            trim: true,
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

const VendorNumberregistration =
    mongoose.models.VendorNumberregistration ||
    mongoose.model("VendorNumberregistration", VendorNumberregistrationSchema);

module.exports = VendorNumberregistration;
