const UniversalApply = require("../models/universal_apply_model");

class UniversalApplyService {
    constructor() {
        this.debug = this.debug.bind(this);
    }

    // Debug function
    debug(message, data = null) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] UNIVERSAL_APPLY_SERVICE: ${message}`);
        if (data) {
            console.log(`[${timestamp}] DATA:`, JSON.stringify(data, null, 2));
        }
    }

    // Create new universal application
    async createUniversalApplication(applicationData) {
        try {
            this.debug('Creating new universal application', applicationData);

            // Validate required fields
            const requiredFields = ['companyName', 'email', 'contactName', 'phoneNumber'];
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
            const application = new UniversalApply({
                companyName: applicationData.companyName.trim(),
                email: applicationData.email.toLowerCase().trim(),
                contactName: applicationData.contactName.trim(),
                phoneNumber: applicationData.phoneNumber.trim()
            });

            const savedApplication = await application.save();
            this.debug('Universal application created successfully', { 
                applicationId: savedApplication._id 
            });

            return {
                success: true,
                data: savedApplication,
                message: 'Universal application created successfully'
            };

        } catch (error) {
            this.debug('Error creating universal application', error);
            
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

    // Get all universal applications with optional filtering
    async getAllUniversalApplications(filters = {}, options = {}) {
        try {
            this.debug('Fetching universal applications', { filters, options });

            const {
                page = 1,
                limit = 10,
                sortBy = 'createdAt',
                sortOrder = 'desc',
                ...queryFilters
            } = { ...filters, ...options };

            // Build query
            const query = {};
            
            // Filter by company name
            if (queryFilters.companyName) {
                query.companyName = { $regex: queryFilters.companyName, $options: 'i' };
            }

            // Filter by contact name
            if (queryFilters.contactName) {
                query.contactName = { $regex: queryFilters.contactName, $options: 'i' };
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
            const applications = await UniversalApply
                .find(query)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .lean();

            // Get total count for pagination
            const totalCount = await UniversalApply.countDocuments(query);
            const totalPages = Math.ceil(totalCount / parseInt(limit));

            this.debug('Universal applications fetched successfully', {
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
                message: 'Universal applications fetched successfully'
            };

        } catch (error) {
            this.debug('Error fetching universal applications', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch applications',
                message: 'An error occurred while fetching applications'
            };
        }
    }

    // Get application by ID
    async getUniversalApplicationById(applicationId) {
        try {
            this.debug('Fetching universal application by ID', { applicationId });

            if (!applicationId) {
                return {
                    success: false,
                    error: 'Application ID is required',
                    message: 'Please provide a valid application ID'
                };
            }

            const application = await UniversalApply.findById(applicationId);

            if (!application) {
                return {
                    success: false,
                    error: 'Application not found',
                    message: 'No application found with the provided ID'
                };
            }

            this.debug('Universal application found', { applicationId: application._id });

            return {
                success: true,
                data: application,
                message: 'Universal application fetched successfully'
            };

        } catch (error) {
            this.debug('Error fetching universal application by ID', error);
            
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

    // Update application
    async updateUniversalApplication(applicationId, updateData) {
        try {
            this.debug('Updating universal application', { applicationId, updateData });

            const application = await UniversalApply.findByIdAndUpdate(
                applicationId,
                updateData,
                { new: true, runValidators: true }
            );

            if (!application) {
                return {
                    success: false,
                    error: 'Application not found',
                    message: 'No application found with the provided ID'
                };
            }

            this.debug('Universal application updated successfully', {
                applicationId: application._id
            });

            return {
                success: true,
                data: application,
                message: 'Universal application updated successfully'
            };

        } catch (error) {
            this.debug('Error updating universal application', error);
            
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
                error: error.message || 'Failed to update application',
                message: 'An error occurred while updating the application'
            };
        }
    }

    // Delete application
    async deleteUniversalApplication(applicationId) {
        try {
            this.debug('Deleting universal application', { applicationId });

            const application = await UniversalApply.findByIdAndDelete(applicationId);

            if (!application) {
                return {
                    success: false,
                    error: 'Application not found',
                    message: 'No application found with the provided ID'
                };
            }

            this.debug('Universal application deleted successfully', { applicationId });

            return {
                success: true,
                data: application,
                message: 'Universal application deleted successfully'
            };

        } catch (error) {
            this.debug('Error deleting universal application', error);
            return {
                success: false,
                error: error.message || 'Failed to delete application',
                message: 'An error occurred while deleting the application'
            };
        }
    }

    // Get application statistics
    async getUniversalApplicationStats() {
        try {
            this.debug('Fetching universal application statistics');

            const stats = await UniversalApply.aggregate([
                {
                    $group: {
                        _id: null,
                        totalApplications: { $sum: 1 }
                    }
                }
            ]);

            // Get applications by company name (top companies)
            const companyStats = await UniversalApply.aggregate([
                {
                    $group: {
                        _id: '$companyName',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]);

            // Get daily applications for the last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const dailyStats = await UniversalApply.aggregate([
                {
                    $match: {
                        createdAt: { $gte: thirtyDaysAgo }
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$createdAt"
                            }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            const result = {
                summary: stats[0] || { totalApplications: 0 },
                topCompanies: companyStats,
                dailyApplications: dailyStats
            };

            this.debug('Universal application statistics fetched', result);

            return {
                success: true,
                data: result,
                message: 'Universal application statistics fetched successfully'
            };

        } catch (error) {
            this.debug('Error fetching universal application statistics', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch statistics',
                message: 'An error occurred while fetching statistics'
            };
        }
    }
    
    // Search applications
    async searchUniversalApplications(searchTerm, filters = {}) {
        try {
            this.debug('Searching universal applications', { searchTerm, filters });
            
            const { page = 1, limit = 10 } = filters;
            const skip = (parseInt(page) - 1) * parseInt(limit);
            
            // Build search query
            const searchQuery = {
                $or: [
                    { companyName: { $regex: searchTerm, $options: 'i' } },
                    { email: { $regex: searchTerm, $options: 'i' } },
                    { contactName: { $regex: searchTerm, $options: 'i' } },
                    { phoneNumber: { $regex: searchTerm, $options: 'i' } }
                ]
            };
            
            // Execute search
            const applications = await UniversalApply
                .find(searchQuery)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean();
                
            // Get total count for pagination
            const totalCount = await UniversalApply.countDocuments(searchQuery);
            const totalPages = Math.ceil(totalCount / parseInt(limit));
            
            this.debug('Universal applications search completed', {
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
                message: 'Universal applications search completed successfully'
            };
            
        } catch (error) {
            this.debug('Error searching universal applications', error);
            return {
                success: false,
                error: error.message || 'Failed to search applications',
                message: 'An error occurred while searching applications'
            };
        }
    }
}

module.exports = UniversalApplyService;