const Licenceregistration = require("../models/licence_model");

class LicenceRegistrationService {
    constructor() {
        this.debug = this.debug.bind(this);
    }

    // Debug function
    debug(message, data = null) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] LICENCE_REGISTRATION_SERVICE: ${message}`);
        if (data) {
            console.log(`[${timestamp}] DATA:`, JSON.stringify(data, null, 2));
        }
    }

    // Create new licence registration application
    async createLicenceApplication(applicationData) {
        try {
            this.debug('Creating new licence registration application', applicationData);

            // Validate required fields
            const requiredFields = [
                'companyName', 
                'email', 
                'address',
                'contactPerson',
                'phoneNumber',
                'businessType',
                'premisesSize',
                'targetMarket'
            ];
            
            const missingFields = requiredFields.filter(field => !applicationData[field]);

            if (missingFields.length > 0) {
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }

            // Validate email format
            const emailRegex = /\S+@\S+\.\S+/;
            if (!emailRegex.test(applicationData.email)) {
                throw new Error('Invalid email format');
            }

            // Create the application
            const application = new Licenceregistration({
                companyName: applicationData.companyName.trim(),
                email: applicationData.email.toLowerCase().trim(),
                address: applicationData.address.trim(),
                contactPerson: applicationData.contactPerson.trim(),
                phoneNumber: applicationData.phoneNumber.trim(),
                businessType: applicationData.businessType.trim(),
                premisesSize: applicationData.premisesSize.trim(),
                targetMarket: applicationData.targetMarket.trim(),
                status: applicationData.status || 'Pending',
                serviceType: applicationData.serviceType || 'Business Licence Registration'
            });

            const savedApplication = await application.save();
            this.debug('Licence registration application created successfully', { 
                applicationId: savedApplication._id 
            });

            return {
                success: true,
                data: savedApplication,
                message: 'Licence registration application created successfully'
            };

        } catch (error) {
            this.debug('Error creating licence registration application', error);
            
            if (error.name === 'ValidationError') {
                const validationErrors = Object.values(error.errors).map(err => err.message);
                return {
                    success: false,
                    error: 'Validation Error',
                    message: validationErrors.join(', '),
                    details: validationErrors
                };
            }

            if (error.code === 11000) {
                return {
                    success: false,
                    error: 'Duplicate Error',
                    message: 'Licence application with this information already exists'
                };
            }

            return {
                success: false,
                error: error.message || 'Failed to create licence application',
                message: 'An error occurred while creating the licence application'
            };
        }
    }

    // Get all licence applications with optional filtering
    async getAllLicenceApplications(filters = {}, options = {}) {
        try {
            this.debug('Fetching licence registration applications', { filters, options });

            const {
                page = 1,
                limit = 10,
                sortBy = 'createdAt',
                sortOrder = 'desc',
                ...queryFilters
            } = { ...filters, ...options };

            // Build query
            const query = {};
            
            // Filter by status
            if (queryFilters.status) {
                query.status = queryFilters.status;
            }

            // Filter by company name
            if (queryFilters.companyName) {
                query.companyName = { $regex: queryFilters.companyName, $options: 'i' };
            }

            // Filter by contact person
            if (queryFilters.contactPerson) {
                query.contactPerson = { $regex: queryFilters.contactPerson, $options: 'i' };
            }
            
            // Filter by business type
            if (queryFilters.businessType) {
                query.businessType = { $regex: queryFilters.businessType, $options: 'i' };
            }
            
            // Filter by email
            if (queryFilters.email) {
                query.email = { $regex: queryFilters.email, $options: 'i' };
            }

            // Date range filter
            if (queryFilters.startDate || queryFilters.endDate) {
                query.createdAt = {};
                if (queryFilters.startDate) {
                    query.createdAt.$gte = new Date(queryFilters.startDate);
                }
                if (queryFilters.endDate) {
                    query.createdAt.$lte = new Date(queryFilters.endDate);
                }
            }

            // Calculate skip for pagination
            const skip = (parseInt(page) - 1) * parseInt(limit);

            // Build sort object
            const sort = {};
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

            // Execute query
            const applications = await Licenceregistration
                .find(query)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .lean();

            // Get total count for pagination
            const totalCount = await Licenceregistration.countDocuments(query);
            const totalPages = Math.ceil(totalCount / parseInt(limit));

            this.debug('Licence registration applications fetched successfully', {
                count: applications.length,
                totalCount,
                page,
                totalPages
            });

            return {
                success: true,
                data: applications,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalCount,
                    limit: parseInt(limit),
                    hasNextPage: parseInt(page) < totalPages,
                    hasPrevPage: parseInt(page) > 1
                },
                message: 'Licence registration applications fetched successfully'
            };

        } catch (error) {
            this.debug('Error fetching licence registration applications', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch licence applications',
                message: 'An error occurred while fetching licence applications'
            };
        }
    }

    // Get licence application by ID
    async getLicenceApplicationById(applicationId) {
        try {
            this.debug('Fetching licence registration application by ID', { applicationId });

            if (!applicationId) {
                return {
                    success: false,
                    error: 'Application ID is required',
                    message: 'Please provide a valid application ID'
                };
            }

            const application = await Licenceregistration.findById(applicationId);

            if (!application) {
                return {
                    success: false,
                    error: 'Application not found',
                    message: 'No licence application found with the provided ID'
                };
            }

            this.debug('Licence registration application found', { applicationId: application._id });

            return {
                success: true,
                data: application,
                message: 'Licence registration application fetched successfully'
            };

        } catch (error) {
            this.debug('Error fetching licence registration application by ID', error);
            
            if (error.name === 'CastError') {
                return {
                    success: false,
                    error: 'Invalid Application ID',
                    message: 'Please provide a valid application ID'
                };
            }

            return {
                success: false,
                error: error.message || 'Failed to fetch licence application',
                message: 'An error occurred while fetching the licence application'
            };
        }
    }

    // Update licence application status
async updateLicenceApplicationStatus(applicationId, newStatus, updateData = {}) {
    try {
        this.debug('Updating licence registration application status', { 
            applicationId, 
            newStatus, 
            updateData 
        });

        const validStatuses = [
            "Pending",
            "Approved",
            "Rejected",
            "In Review",
            "Processing",
            "Completed"
        ];
        
        if (!validStatuses.includes(newStatus)) {
            return {
                success: false,
                error: 'Invalid Status',
                message: `Status must be one of: ${validStatuses.join(', ')}`
            };
        }

        const updateObject = {
            status: newStatus,
            ...updateData
        };

        const application = await Licenceregistration.findByIdAndUpdate(
            applicationId,
            updateObject,
            { new: true, runValidators: true }
        );

        if (!application) {
            return {
                success: false,
                error: 'Application not found',
                message: 'No licence application found with the provided ID'
            };
        }

        this.debug('Licence registration application status updated successfully', {
            applicationId: application._id,
            newStatus: application.status
        });

        // Send WhatsApp notification if status is approved
        if (newStatus === "Approved" && application.phoneNumber) {
            await this.sendApprovalNotification(application);
        }

        return {
            success: true,
            data: application,
            message: 'Licence registration application status updated successfully'
        };

    } catch (error) {
        this.debug('Error updating licence registration application status', error);
        return {
            success: false,
            error: error.message || 'Failed to update licence application',
            message: 'An error occurred while updating the licence application'
        };
    }
}


async sendApprovalNotification(application) {
    try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const twilioPhoneNumber = process.env.TWILIO_WHATSAPP_NUMBER; // Should be in format: whatsapp:+14155238886
        
        const client = require('twilio')(accountSid, authToken);

        const message = `🎉 *Congratulations! Your License Application Has Been Approved!*\n\n` +
                       `📋 *Application ID:* ${application.applicationId}\n` +
                       `📜 *License Type:* ${application.licenseType}\n` +
                       `🏢 *Company Name:* ${application.companyName}\n` +
                       `✅ *Status:* APPROVED\n\n` +
                       `Your ${application.licenseType} application has been successfully approved. You will receive further instructions via email regarding the next steps.\n\n` +
                       `📞 For any queries, please contact our support team.\n\n` +
                       `Thank you for choosing our services!`;

        // Send WhatsApp message
        const result = await client.messages.create({
            body: message,
            from: twilioPhoneNumber,
            to: `whatsapp:${application.phoneNumber}`
        });

        this.debug('WhatsApp approval notification sent successfully', {
            applicationId: application.applicationId,
            phoneNumber: application.phoneNumber,
            messageSid: result.sid
        });

        return {
            success: true,
            messageSid: result.sid
        };

    } catch (error) {
        this.debug('Error sending WhatsApp approval notification', {
            error: error.message,
            applicationId: application.applicationId,
            phoneNumber: application.phoneNumber
        });
        
        // Don't fail the entire update if notification fails
        console.error('WhatsApp notification failed:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

    // Delete licence application
    async deleteLicenceApplication(applicationId) {
        try {
            this.debug('Deleting licence registration application', { applicationId });

            const application = await Licenceregistration.findByIdAndDelete(applicationId);

            if (!application) {
                return {
                    success: false,
                    error: 'Application not found',
                    message: 'No licence application found with the provided ID'
                };
            }

            this.debug('Licence registration application deleted successfully', { applicationId });

            return {
                success: true,
                data: application,
                message: 'Licence registration application deleted successfully'
            };

        } catch (error) {
            this.debug('Error deleting licence registration application', error);
            return {
                success: false,
                error: error.message || 'Failed to delete licence application',
                message: 'An error occurred while deleting the licence application'
            };
        }
    }

    // Get licence application statistics
    async getLicenceApplicationStats() {
        try {
            this.debug('Fetching licence registration application statistics');

            const stats = await Licenceregistration.aggregate([
                {
                    $group: {
                        _id: null,
                        totalApplications: { $sum: 1 },
                        pendingApplications: {
                            $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
                        },
                        approvedApplications: {
                            $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] }
                        },
                        rejectedApplications: {
                            $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] }
                        },
                        inReviewApplications: {
                            $sum: { $cond: [{ $eq: ['$status', 'In Review'] }, 1, 0] }
                        },
                        processingApplications: {
                            $sum: { $cond: [{ $eq: ['$status', 'Processing'] }, 1, 0] }
                        },
                        completedApplications: {
                            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
                        }
                    }
                }
            ]);

            // Get applications by business type
            const businessTypeStats = await Licenceregistration.aggregate([
                {
                    $group: {
                        _id: '$businessType',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } }
            ]);

            // Get applications by premises size
            const premisesSizeStats = await Licenceregistration.aggregate([
                {
                    $group: {
                        _id: '$premisesSize',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } }
            ]);

            const result = {
                summary: stats[0] || {
                    totalApplications: 0,
                    pendingApplications: 0,
                    approvedApplications: 0,
                    rejectedApplications: 0,
                    inReviewApplications: 0,
                    processingApplications: 0,
                    completedApplications: 0
                },
                businessTypes: businessTypeStats,
                premisesSizes: premisesSizeStats
            };

            this.debug('Licence registration application statistics fetched', result);

            return {
                success: true,
                data: result,
                message: 'Licence registration application statistics fetched successfully'
            };

        } catch (error) {
            this.debug('Error fetching licence registration application statistics', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch licence statistics',
                message: 'An error occurred while fetching licence statistics'
            };
        }
    }
    
    // Search licence applications
    async searchLicenceApplications(searchTerm, filters = {}) {
        try {
            this.debug('Searching licence registration applications', { searchTerm, filters });
            
            const { page = 1, limit = 10 } = filters;
            const skip = (parseInt(page) - 1) * parseInt(limit);
            
            // Build search query
            const searchQuery = {
                $or: [
                    { companyName: { $regex: searchTerm, $options: 'i' } },
                    { email: { $regex: searchTerm, $options: 'i' } },
                    { contactPerson: { $regex: searchTerm, $options: 'i' } },
                    { businessType: { $regex: searchTerm, $options: 'i' } },
                    { targetMarket: { $regex: searchTerm, $options: 'i' } },
                    { address: { $regex: searchTerm, $options: 'i' } }
                ]
            };
            
            // Add status filter if provided
            if (filters.status) {
                searchQuery.status = filters.status;
            }
            
            // Execute search
            const applications = await Licenceregistration
                .find(searchQuery)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean();
                
            // Get total count for pagination
            const totalCount = await Licenceregistration.countDocuments(searchQuery);
            const totalPages = Math.ceil(totalCount / parseInt(limit));
            
            this.debug('Licence registration applications search completed', {
                searchTerm,
                count: applications.length,
                totalCount
            });
            
            return {
                success: true,
                data: applications,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalCount,
                    limit: parseInt(limit),
                    hasNextPage: parseInt(page) < totalPages,
                    hasPrevPage: parseInt(page) > 1
                },
                message: 'Licence registration applications search completed successfully'
            };
            
        } catch (error) {
            this.debug('Error searching licence registration applications', error);
            return {
                success: false,
                error: error.message || 'Failed to search licence applications',
                message: 'An error occurred while searching licence applications'
            };
        }
    }

    // Update entire licence application
    async updateLicenceApplication(applicationId, updateData) {
        try {
            this.debug('Updating licence registration application', { applicationId, updateData });

            const application = await Licenceregistration.findByIdAndUpdate(
                applicationId,
                updateData,
                { new: true, runValidators: true }
            );

            if (!application) {
                return {
                    success: false,
                    error: 'Application not found',
                    message: 'No licence application found with the provided ID'
                };
            }

            this.debug('Licence registration application updated successfully', {
                applicationId: application._id
            });

            return {
                success: true,
                data: application,
                message: 'Licence registration application updated successfully'
            };

        } catch (error) {
            this.debug('Error updating licence registration application', error);
            
            if (error.name === 'ValidationError') {
                const validationErrors = Object.values(error.errors).map(err => err.message);
                return {
                    success: false,
                    error: 'Validation Error',
                    message: validationErrors.join(', '),
                    details: validationErrors
                };
            }

            return {
                success: false,
                error: error.message || 'Failed to update licence application',
                message: 'An error occurred while updating the licence application'
            };
        }
    }
}

module.exports = LicenceRegistrationService;