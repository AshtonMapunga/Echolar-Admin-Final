

// models/apply_service.js
const mongoose = require('mongoose');

const directorSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    idNumber: {
        type: String,
        required: true,
    },
    nationality: {
        type: String,
        required: true,
    },
    occupation: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    }
});

const applicationServiceSchema = new mongoose.Schema(
    {
        // Basic applicant information
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
        },
        
        // Service information
        serviceType: {
            type: String,
            required: true,
            default: "Company Registration"
        },
        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected", "In Review", "Processing", "Completed"],
            default: "Pending",
        },
        
        // Company registration specific fields
        companyName: {
            type: String,
            required: false,
        },
        companyName2: {
            type: String,
            required: false,
        },
        companyName3: {
            type: String,
            required: false,
        },
        
        // Directors information
        directors: [directorSchema],
        directorsCount: {
            type: Number,
            required: false,
            min: 1,
            max: 10
        },
        
        // Contact information
        contactEmail: {
            type: String,
            required: false,
            lowercase: true,
            match: [/\S+@\S+\.\S+/, "Invalid email format"]
        },
        
        businessType: {
            type: String,
            required: false,
            trim: true
        },
        companyAddress: {
            type: String,
            required: false,
            trim: true
        },
        positionInCompany: {
            type: String,
            required: false,
            trim: true
        },
        registrationNumber: {
            type: String,
            required: false,
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
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);







const ApplicationService = mongoose.model("ApplicationService", applicationServiceSchema);

module.exports = ApplicationService;