const CollegeRegistration = require("../models/college_reg_model");

class CollegeRegistrationService {
    constructor() {
        this.debug = this.debug.bind(this);
    }

    // Debug function
    debug(message, data = null) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] COLLEGE_REGISTRATION_SERVICE: ${message}`);
        if (data) {
            console.log(`[${timestamp}] DATA:`, JSON.stringify(data, null, 2));
        }
    }

    // Create new college registration application
    async createCollegeRegistration(registrationData) {
        try {
            this.debug('Creating new college registration application', registrationData);

            // Validate required fields
            const requiredFields = [
                'applicantName', 
                'churchName', 
                'email',
                'phoneNumber',
                'whatsappNumber'
            ];
            
            const missingFields = requiredFields.filter(field => !registrationData[field]);

            if (missingFields.length > 0) {
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }

            // Validate email format
            const emailRegex = /\S+@\S+\.\S+/;
            if (!emailRegex.test(registrationData.email)) {
                throw new Error('Invalid email format');
            }

            // Create the registration
            const registration = new CollegeRegistration({
                applicantName: registrationData.applicantName.trim(),
                churchName: registrationData.churchName.trim(),
                email: registrationData.email.toLowerCase().trim(),
                phoneNumber: registrationData.phoneNumber.trim(),
                whatsappNumber: registrationData.whatsappNumber.trim(),
                serviceType: 'College Registration'
            });

            const savedRegistration = await registration.save();
            this.debug('College registration application created successfully', { 
                registrationId: savedRegistration._id 
            });

            return {
                success: true,
                data: savedRegistration,
                message: 'College registration application created successfully'
            };

        } catch (error) {
            this.debug('Error creating college registration application', error);
            
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
                    message: 'College registration with this information already exists'
                };
            }

            return {
                success: false,
                error: error.message || 'Failed to create college registration',
                message: 'An error occurred while creating the college registration'
            };
        }
    }

    // Get all college registrations with optional filtering
    async getAllCollegeRegistrations(filters = {}, options = {}) {
        try {
            this.debug('Fetching college registration applications', { filters, options });

            const {
                page = 1,
                limit = 10,
                sortBy = 'createdAt',
                sortOrder = 'desc',
                ...queryFilters
            } = { ...filters, ...options };

            // Build query
            const query = {};
            
            // Filter by applicant name
            if (queryFilters.applicantName) {
                query.applicantName = { $regex: queryFilters.applicantName, $options: 'i' };
            }

            // Filter by church name
            if (queryFilters.churchName) {
                query.churchName = { $regex: queryFilters.churchName, $options: 'i' };
            }

            // Filter by email
            if (queryFilters.email) {
                query.email = { $regex: queryFilters.email, $options: 'i' };
            }
            
            // Filter by phone number
            if (queryFilters.phoneNumber) {
                query.phoneNumber = { $regex: queryFilters.phoneNumber, $options: 'i' };
            }
            
            // Filter by status
            if (queryFilters.status) {
                query.status = queryFilters.status;
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
            const registrations = await CollegeRegistration
                .find(query)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .lean();

            // Get total count for pagination
            const totalCount = await CollegeRegistration.countDocuments(query);
            const totalPages = Math.ceil(totalCount / parseInt(limit));

            this.debug('College registration applications fetched successfully', {
                count: registrations.length,
                totalCount,
                page,
                totalPages
            });

            return {
                success: true,
                data: registrations,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalCount,
                    limit: parseInt(limit),
                    hasNextPage: parseInt(page) < totalPages,
                    hasPrevPage: parseInt(page) > 1
                },
                message: 'College registration applications fetched successfully'
            };

        } catch (error) {
            this.debug('Error fetching college registration applications', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch college registrations',
                message: 'An error occurred while fetching college registrations'
            };
        }
    }

    // Get college registration by ID
    async getCollegeRegistrationById(registrationId) {
        try {
            this.debug('Fetching college registration application by ID', { registrationId });

            if (!registrationId) {
                return {
                    success: false,
                    error: 'Registration ID is required',
                    message: 'Please provide a valid registration ID'
                };
            }

            const registration = await CollegeRegistration.findById(registrationId);

            if (!registration) {
                return {
                    success: false,
                    error: 'Registration not found',
                    message: 'No college registration found with the provided ID'
                };
            }

            this.debug('College registration application found', { registrationId: registration._id });

            return {
                success: true,
                data: registration,
                message: 'College registration application fetched successfully'
            };

        } catch (error) {
            this.debug('Error fetching college registration application by ID', error);
            
            if (error.name === 'CastError') {
                return {
                    success: false,
                    error: 'Invalid Registration ID',
                    message: 'Please provide a valid registration ID'
                };
            }

            return {
                success: false,
                error: error.message || 'Failed to fetch college registration',
                message: 'An error occurred while fetching the college registration'
            };
        }
    }

    // Update college registration
    async updateCollegeRegistration(registrationId, updateData = {}) {
        try {
            this.debug('Updating college registration application', { 
                registrationId, 
                updateData 
            });

            // Validate email format if email is being updated
            if (updateData.email) {
                const emailRegex = /\S+@\S+\.\S+/;
                if (!emailRegex.test(updateData.email)) {
                    return {
                        success: false,
                        error: 'Invalid email format',
                        message: 'Please provide a valid email address'
                    };
                }
                updateData.email = updateData.email.toLowerCase().trim();
            }

            const registration = await CollegeRegistration.findByIdAndUpdate(
                registrationId,
                updateData,
                { new: true, runValidators: true }
            );

            if (!registration) {
                return {
                    success: false,
                    error: 'Registration not found',
                    message: 'No college registration found with the provided ID'
                };
            }

            this.debug('College registration application updated successfully', {
                registrationId: registration._id
            });

            return {
                success: true,
                data: registration,
                message: 'College registration application updated successfully'
            };

        } catch (error) {
            this.debug('Error updating college registration application', error);
            
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
                error: error.message || 'Failed to update college registration',
                message: 'An error occurred while updating the college registration'
            };
        }
    }

    // Delete college registration
    async deleteCollegeRegistration(registrationId) {
        try {
            this.debug('Deleting college registration application', { registrationId });

            const registration = await CollegeRegistration.findByIdAndDelete(registrationId);

            if (!registration) {
                return {
                    success: false,
                    error: 'Registration not found',
                    message: 'No college registration found with the provided ID'
                };
            }

            this.debug('College registration application deleted successfully', { registrationId });

            return {
                success: true,
                data: registration,
                message: 'College registration application deleted successfully'
            };

        } catch (error) {
            this.debug('Error deleting college registration application', error);
            return {
                success: false,
                error: error.message || 'Failed to delete college registration',
                message: 'An error occurred while deleting the college registration'
            };
        }
    }

    // Get college registration statistics
    async getCollegeRegistrationStats() {
        try {
            this.debug('Fetching college registration application statistics');

            const stats = await CollegeRegistration.aggregate([
                {
                    $group: {
                        _id: null,
                        totalRegistrations: { $sum: 1 },
                        uniqueChurches: { $addToSet: '$churchName' }
                    }
                },
                {
                    $project: {
                        totalRegistrations: 1,
                        uniqueChurchCount: { $size: '$uniqueChurches' }
                    }
                }
            ]);

            // Get registrations by church
            const churchStats = await CollegeRegistration.aggregate([
                {
                    $group: {
                        _id: '$churchName',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } }
            ]);

            // Get registrations by status
            const statusStats = await CollegeRegistration.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } }
            ]);

            const result = {
                summary: stats[0] || {
                    totalRegistrations: 0,
                    uniqueChurchCount: 0
                },
                churches: churchStats,
                statuses: statusStats
            };

            this.debug('College registration application statistics fetched', result);

            return {
                success: true,
                data: result,
                message: 'College registration application statistics fetched successfully'
            };

        } catch (error) {
            this.debug('Error fetching college registration application statistics', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch college registration statistics',
                message: 'An error occurred while fetching college registration statistics'
            };
        }
    }
    
    // Search college registrations
    async searchCollegeRegistrations(searchTerm, filters = {}) {
        try {
            this.debug('Searching college registration applications', { searchTerm, filters });
            
            const { page = 1, limit = 10 } = filters;
            const skip = (parseInt(page) - 1) * parseInt(limit);
            
            // Build search query
            const searchQuery = {
                $or: [
                    { applicantName: { $regex: searchTerm, $options: 'i' } },
                    { churchName: { $regex: searchTerm, $options: 'i' } },
                    { email: { $regex: searchTerm, $options: 'i' } },
                    { phoneNumber: { $regex: searchTerm, $options: 'i' } },
                    { whatsappNumber: { $regex: searchTerm, $options: 'i' } }
                ]
            };
            
            // Add status filter if provided
            if (filters.status) {
                searchQuery.status = filters.status;
            }
            
            // Execute search
            const registrations = await CollegeRegistration
                .find(searchQuery)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean();
                
            // Get total count for pagination
            const totalCount = await CollegeRegistration.countDocuments(searchQuery);
            const totalPages = Math.ceil(totalCount / parseInt(limit));
            
            this.debug('College registration applications search completed', {
                searchTerm,
                count: registrations.length,
                totalCount
            });
            
            return {
                success: true,
                data: registrations,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalCount,
                    limit: parseInt(limit),
                    hasNextPage: parseInt(page) < totalPages,
                    hasPrevPage: parseInt(page) > 1
                },
                message: 'College registration applications search completed successfully'
            };
            
        } catch (error) {
            this.debug('Error searching college registration applications', error);
            return {
                success: false,
                error: error.message || 'Failed to search college registrations',
                message: 'An error occurred while searching college registrations'
            };
        }
    }
}

module.exports = CollegeRegistrationService;