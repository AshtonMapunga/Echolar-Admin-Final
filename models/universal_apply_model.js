// models/company_deregistration.js
const mongoose = require("mongoose");

const UniversalApplySchema = new mongoose.Schema(
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
       

        contactName: {
            type: String,
            required: true,

        },

        phoneNumber: {
            type: String,
            required: true,

        },

           serviceType: {
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

const UniversalApply =
    mongoose.models.UniversalApply ||
    mongoose.model("UniversalApply", UniversalApplySchema);

module.exports = UniversalApply;
