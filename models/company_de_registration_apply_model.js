// models/company_deregistration.js
const mongoose = require("mongoose");

const companyDeregistrationSchema = new mongoose.Schema(
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
    applicantPhone: {
      type: String,
      required: true,
      trim: true,
    },

    serviceType: {
      type: String,
      default: "Company De-Registration",
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

    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    businessType: {
      type: String,
      required: false,
      trim: true,
    },
    registrationNumber: {
      type: String,
      required: true,
      trim: true,
    },
    registrationDate: {
      type: String, // you can change to Date if you want proper date handling
      required: false,
    },

    positionInCompany: {
      type: String,
      required: false,
      trim: true,
    },
    authorityToAct: {
      type: String,
      required: false,
      trim: true,
    },
    deregistrationReason: {
      type: String,
      required: true,
      trim: true,
    },

    hasOutstandingObligations: {
      type: Boolean,
      default: false,
    },
    outstandingDetails: {
      type: String,
      default: "None",
    },
  },
  {
    timestamps: true,
  }
);

const CompanyDeregistration =
  mongoose.models.CompanyDeregistration ||
  mongoose.model("CompanyDeregistration", companyDeregistrationSchema);

module.exports = CompanyDeregistration;
