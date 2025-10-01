const ApplicationService = require("../models/apply_service");

class ApplicationServiceHandler {
    constructor() {
        this.debug = this.debug.bind(this);
    }

    // Debug function
    debug(message, data = null) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] APPLICATION_SERVICE: ${message}`);
        if (data) {
            console.log(`[${timestamp}] DATA:`, JSON.stringify(data, null, 2));
        }
    }

    // Create new application
    async createApplication(applicationData) {
        try {
            this.debug('Creating new application', applicationData);

            // Validate required fields
            const requiredFields = ['applicantName', 'applicantEmail', 'applicantPhone', 'serviceType'];
            const missingFields = requiredFields.filter(field => !applicationData[field]);

            if (missingFields.length > 0) {
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }

            // Create the application
            const application = new ApplicationService({
                applicantName: applicationData.applicantName.trim(),
                applicantEmail: applicationData.applicantEmail.toLowerCase().trim(),
                applicantPhone: applicationData.applicantPhone.trim(),
                serviceType: applicationData.serviceType,
                status: applicationData.status || 'Pending',
                
                // Optional company fields
                companyName: applicationData.companyName?.trim() || null,
                businessType: applicationData.businessType?.trim() || null,
                companyAddress: applicationData.companyAddress?.trim() || null,
                positionInCompany: applicationData.positionInCompany?.trim() || null,
                registrationNumber: applicationData.registrationNumber?.trim() || null,
            });

            const savedApplication = await application.save();
            this.debug('Application created successfully', { applicationId: savedApplication._id });

            return {
                success: true,
                data: savedApplication,
                message: 'Application created successfully'
            };

        } catch (error) {
            this.debug('Error creating application', error);
            
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
                    message: 'Application with this information already exists'
                };
            }

            return {
                success: false,
                error: error.message || 'Failed to create application',
                message: 'An error occurred while creating the application'
            };
        }
    }

    // Get all applications with optional filtering
    async getAllApplications(filters = {}, options = {}) {
        try {
            this.debug('Fetching applications', { filters, options });

            const {
                page = 1,
                limit = 10,
                sortBy = 'createdAt',
                sortOrder = 'desc',
                ...queryFilters
            } = { ...filters, ...options };

            // Build query
            const query = {};
            
            // Filter by service type
            if (queryFilters.serviceType) {
                query.serviceType = { $regex: queryFilters.serviceType, $options: 'i' };
            }

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
            const applications = await ApplicationService
                .find(query)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .lean();

            // Get total count for pagination
            const totalCount = await ApplicationService.countDocuments(query);
            const totalPages = Math.ceil(totalCount / parseInt(limit));

            this.debug('Applications fetched successfully', {
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
                message: 'Applications fetched successfully'
            };

        } catch (error) {
            this.debug('Error fetching applications', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch applications',
                message: 'An error occurred while fetching applications'
            };
        }
    }

    // Get application by ID
    async getApplicationById(applicationId) {
        try {
            this.debug('Fetching application by ID', { applicationId });

            if (!applicationId) {
                return {
                    success: false,
                    error: 'Application ID is required',
                    message: 'Please provide a valid application ID'
                };
            }

            const application = await ApplicationService.findById(applicationId);

            if (!application) {
                return {
                    success: false,
                    error: 'Application not found',
                    message: 'No application found with the provided ID'
                };
            }

            this.debug('Application found', { applicationId: application._id });

            return {
                success: true,
                data: application,
                message: 'Application fetched successfully'
            };

        } catch (error) {
            this.debug('Error fetching application by ID', error);
            
            if (error.name === 'CastError') {
                return {
                    success: false,
                    error: 'Invalid Application ID',
                    message: 'Please provide a valid application ID'
                };
            }

            return {
                success: false,
                error: error.message || 'Failed to fetch application',
                message: 'An error occurred while fetching the application'
            };
        }
    }

    // Update application status
    async updateApplicationStatus(applicationId, newStatus, updateData = {}) {
        try {
            this.debug('Updating application status', { applicationId, newStatus, updateData });

            const validStatuses = ['Pending', 'Approved', 'Rejected'];
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

            const application = await ApplicationService.findByIdAndUpdate(
                applicationId,
                updateObject,
                { new: true, runValidators: true }
            );

            if (!application) {
                return {
                    success: false,
                    error: 'Application not found',
                    message: 'No application found with the provided ID'
                };
            }

            this.debug('Application status updated successfully', {
                applicationId: application._id,
                newStatus: application.status
            });

            return {
                success: true,
                data: application,
                message: 'Application status updated successfully'
            };

        } catch (error) {
            this.debug('Error updating application status', error);
            return {
                success: false,
                error: error.message || 'Failed to update application',
                message: 'An error occurred while updating the application'
            };
        }
    }

    // Delete application
    async deleteApplication(applicationId) {
        try {
            this.debug('Deleting application', { applicationId });

            const application = await ApplicationService.findByIdAndDelete(applicationId);

            if (!application) {
                return {
                    success: false,
                    error: 'Application not found',
                    message: 'No application found with the provided ID'
                };
            }

            this.debug('Application deleted successfully', { applicationId });

            return {
                success: true,
                data: application,
                message: 'Application deleted successfully'
            };

        } catch (error) {
            this.debug('Error deleting application', error);
            return {
                success: false,
                error: error.message || 'Failed to delete application',
                message: 'An error occurred while deleting the application'
            };
        }
    }

    // Get application statistics
    async getApplicationStats() {
        try {
            this.debug('Fetching application statistics');

            const stats = await ApplicationService.aggregate([
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
                        }
                    }
                }
            ]);

            const serviceTypeStats = await ApplicationService.aggregate([
                {
                    $group: {
                        _id: '$serviceType',
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
                    rejectedApplications: 0
                },
                serviceTypes: serviceTypeStats
            };

            this.debug('Application statistics fetched', result);

            return {
                success: true,
                data: result,
                message: 'Application statistics fetched successfully'
            };

        } catch (error) {
            this.debug('Error fetching application statistics', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch statistics',
                message: 'An error occurred while fetching statistics'
            };
        }
    }
}

module.exports = ApplicationServiceHandler;