// services/companyDeregistrationService.js
const CompanyDeregistration = require("../models/company_de_registration_apply_model");

class CompanyDeregistrationService {
    constructor() {
        this.debug = this.debug.bind(this);
    }

    // Debug function
    debug(message, data = null) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] COMPANY_DEREGISTRATION_SERVICE: ${message}`);
        if (data) {
            console.log(`[${timestamp}] DATA:`, JSON.stringify(data, null, 2));
        }
    }

    // Create new company deregistration application
    async createDeregistrationApplication(applicationData) {
        try {
            this.debug('Creating new company deregistration application', applicationData);

            // Validate required fields
            const requiredFields = [
                'applicantName', 
                'applicantEmail', 
                'applicantPhone', 
                'companyName',
                'registrationNumber',
                'deregistrationReason'
            ];
            
            const missingFields = requiredFields.filter(field => !applicationData[field]);

            if (missingFields.length > 0) {
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }

            // Validate email format
            const emailRegex = /\S+@\S+\.\S+/;
            if (!emailRegex.test(applicationData.applicantEmail)) {
                throw new Error('Invalid email format');
            }

            // Create the application
            const application = new CompanyDeregistration({
                applicantName: applicationData.applicantName.trim(),
                applicantEmail: applicationData.applicantEmail.toLowerCase().trim(),
                applicantPhone: applicationData.applicantPhone.trim(),
                serviceType: "Company De-Registration",
                status: applicationData.status || 'Pending',
                
                // Company information
                companyName: applicationData.companyName.trim(),
                businessType: applicationData.businessType?.trim() || null,
                registrationNumber: applicationData.registrationNumber.trim(),
                registrationDate: applicationData.registrationDate || null,
                
                // Applicant details
                positionInCompany: applicationData.positionInCompany?.trim() || null,
                authorityToAct: applicationData.authorityToAct?.trim() || null,
                deregistrationReason: applicationData.deregistrationReason.trim(),
                
                // Outstanding obligations
                hasOutstandingObligations: applicationData.hasOutstandingObligations || false,
                outstandingDetails: applicationData.outstandingDetails || 'None'
            });

            const savedApplication = await application.save();
            this.debug('Company deregistration application created successfully', { 
                applicationId: savedApplication._id 
            });

            return {
                success: true,
                data: savedApplication,
                message: 'Company deregistration application created successfully'
            };

        } catch (error) {
            this.debug('Error creating company deregistration application', error);
            
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
                    message: 'Deregistration application with this information already exists'
                };
            }

            return {
                success: false,
                error: error.message || 'Failed to create deregistration application',
                message: 'An error occurred while creating the deregistration application'
            };
        }
    }

    // Get all deregistration applications with optional filtering
    async getAllDeregistrationApplications(filters = {}, options = {}) {
        try {
            this.debug('Fetching company deregistration applications', { filters, options });

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

            // Filter by applicant name
            if (queryFilters.applicantName) {
                query.applicantName = { $regex: queryFilters.applicantName, $options: 'i' };
            }

            // Filter by company name
            if (queryFilters.companyName) {
                query.companyName = { $regex: queryFilters.companyName, $options: 'i' };
            }
            
            // Filter by registration number
            if (queryFilters.registrationNumber) {
                query.registrationNumber = { $regex: queryFilters.registrationNumber, $options: 'i' };
            }
            
            // Filter by outstanding obligations
            if (queryFilters.hasOutstandingObligations !== undefined) {
                query.hasOutstandingObligations = queryFilters.hasOutstandingObligations;
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
            const applications = await CompanyDeregistration
                .find(query)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .lean();

            // Get total count for pagination
            const totalCount = await CompanyDeregistration.countDocuments(query);
            const totalPages = Math.ceil(totalCount / parseInt(limit));

            this.debug('Company deregistration applications fetched successfully', {
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
                message: 'Company deregistration applications fetched successfully'
            };

        } catch (error) {
            this.debug('Error fetching company deregistration applications', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch deregistration applications',
                message: 'An error occurred while fetching deregistration applications'
            };
        }
    }

    // Get deregistration application by ID
    async getDeregistrationApplicationById(applicationId) {
        try {
            this.debug('Fetching company deregistration application by ID', { applicationId });

            if (!applicationId) {
                return {
                    success: false,
                    error: 'Application ID is required',
                    message: 'Please provide a valid application ID'
                };
            }

            const application = await CompanyDeregistration.findById(applicationId);

            if (!application) {
                return {
                    success: false,
                    error: 'Application not found',
                    message: 'No deregistration application found with the provided ID'
                };
            }

            this.debug('Company deregistration application found', { applicationId: application._id });

            return {
                success: true,
                data: application,
                message: 'Company deregistration application fetched successfully'
            };

        } catch (error) {
            this.debug('Error fetching company deregistration application by ID', error);
            
            if (error.name === 'CastError') {
                return {
                    success: false,
                    error: 'Invalid Application ID',
                    message: 'Please provide a valid application ID'
                };
            }

            return {
                success: false,
                error: error.message || 'Failed to fetch deregistration application',
                message: 'An error occurred while fetching the deregistration application'
            };
        }
    }

    // Update deregistration application status
    async updateDeregistrationApplicationStatus(applicationId, newStatus, updateData = {}) {
        try {
            this.debug('Updating company deregistration application status', { 
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

            const application = await CompanyDeregistration.findByIdAndUpdate(
                applicationId,
                updateObject,
                { new: true, runValidators: true }
            );

            if (!application) {
                return {
                    success: false,
                    error: 'Application not found',
                    message: 'No deregistration application found with the provided ID'
                };
            }

            this.debug('Company deregistration application status updated successfully', {
                applicationId: application._id,
                newStatus: application.status
            });

            return {
                success: true,
                data: application,
                message: 'Company deregistration application status updated successfully'
            };

        } catch (error) {
            this.debug('Error updating company deregistration application status', error);
            return {
                success: false,
                error: error.message || 'Failed to update deregistration application',
                message: 'An error occurred while updating the deregistration application'
            };
        }
    }

    // Delete deregistration application
    async deleteDeregistrationApplication(applicationId) {
        try {
            this.debug('Deleting company deregistration application', { applicationId });

            const application = await CompanyDeregistration.findByIdAndDelete(applicationId);

            if (!application) {
                return {
                    success: false,
                    error: 'Application not found',
                    message: 'No deregistration application found with the provided ID'
                };
            }

            this.debug('Company deregistration application deleted successfully', { applicationId });

            return {
                success: true,
                data: application,
                message: 'Company deregistration application deleted successfully'
            };

        } catch (error) {
            this.debug('Error deleting company deregistration application', error);
            return {
                success: false,
                error: error.message || 'Failed to delete deregistration application',
                message: 'An error occurred while deleting the deregistration application'
            };
        }
    }

    // Get deregistration application statistics
    async getDeregistrationApplicationStats() {
        try {
            this.debug('Fetching company deregistration application statistics');

            const stats = await CompanyDeregistration.aggregate([
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
                        },
                        applicationsWithObligations: {
                            $sum: { $cond: [{ $eq: ['$hasOutstandingObligations', true] }, 1, 0] }
                        }
                    }
                }
            ]);

            // Get applications by business type
            const businessTypeStats = await CompanyDeregistration.aggregate([
                {
                    $group: {
                        _id: '$businessType',
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
                    completedApplications: 0,
                    applicationsWithObligations: 0
                },
                businessTypes: businessTypeStats
            };

            this.debug('Company deregistration application statistics fetched', result);

            return {
                success: true,
                data: result,
                message: 'Company deregistration application statistics fetched successfully'
            };

        } catch (error) {
            this.debug('Error fetching company deregistration application statistics', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch deregistration statistics',
                message: 'An error occurred while fetching deregistration statistics'
            };
        }
    }
    
    // Search deregistration applications
    async searchDeregistrationApplications(searchTerm, filters = {}) {
        try {
            this.debug('Searching company deregistration applications', { searchTerm, filters });
            
            const { page = 1, limit = 10 } = filters;
            const skip = (parseInt(page) - 1) * parseInt(limit);
            
            // Build search query
            const searchQuery = {
                $or: [
                    { applicantName: { $regex: searchTerm, $options: 'i' } },
                    { applicantEmail: { $regex: searchTerm, $options: 'i' } },
                    { companyName: { $regex: searchTerm, $options: 'i' } },
                    { registrationNumber: { $regex: searchTerm, $options: 'i' } },
                    { businessType: { $regex: searchTerm, $options: 'i' } }
                ]
            };
            
            // Add status filter if provided
            if (filters.status) {
                searchQuery.status = filters.status;
            }
            
            // Execute search
            const applications = await CompanyDeregistration
                .find(searchQuery)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean();
                
            // Get total count for pagination
            const totalCount = await CompanyDeregistration.countDocuments(searchQuery);
            const totalPages = Math.ceil(totalCount / parseInt(limit));
            
            this.debug('Company deregistration applications search completed', {
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
                message: 'Company deregistration applications search completed successfully'
            };
            
        } catch (error) {
            this.debug('Error searching company deregistration applications', error);
            return {
                success: false,
                error: error.message || 'Failed to search deregistration applications',
                message: 'An error occurred while searching deregistration applications'
            };
        }
    }
}

module.exports = CompanyDeregistrationService;