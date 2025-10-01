const mongoose = require("mongoose");

const ChurchRegistrationSchema = new mongoose.Schema(
    {
        churchName: {
            type: String,
            required: true,
            trim: true,
        },

        founderID: {
            type: String,
            required: true,
            trim: true,
        },
        founderAddress: {
            type: String,
        },
        founderContactNumber: {
            type: String,
            trim: true
        },
        founderName: {
            type: String,
            trim: true
        },
        chuchObjective: {
            type: String,
            trim: true
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

const ChurchRegistration =
    mongoose.models.ChurchRegistration ||
    mongoose.model("ChurchRegistration", ChurchRegistrationSchema);

module.exports = ChurchRegistration;