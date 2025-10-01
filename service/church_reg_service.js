const ChurchRegistration = require("../models/church_registration_model");

class ChurchRegistrationService {
    constructor() {
        this.debug = this.debug.bind(this);
    }

    // Debug function
    debug(message, data = null) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] CHURCH_REGISTRATION_SERVICE: ${message}`);
        if (data) {
            console.log(`[${timestamp}] DATA:`, JSON.stringify(data, null, 2));
        }
    }

    // Create new church registration
    async createChurchRegistration(registrationData) {
        try {
            this.debug('Creating new church registration', registrationData);

            // Validate required fields
            const requiredFields = ['churchName', 'founderID'];
            const missingFields = requiredFields.filter(field => !registrationData[field]);

            if (missingFields.length > 0) {
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }

            // Create the registration
            const registration = new ChurchRegistration({
                churchName: registrationData.churchName.trim(),
                founderID: registrationData.founderID.trim(),
                founderAddress: registrationData.founderAddress?.trim() || null,
                founderContactNumber: registrationData.founderContactNumber?.trim() || null,
                founderName: registrationData.founderName?.trim() || null,
                chuchObjective: registrationData.chuchObjective?.trim() || null
            });

            const savedRegistration = await registration.save();
            this.debug('Church registration created successfully', { 
                registrationId: savedRegistration._id 
            });

            return {
                success: true,
                data: savedRegistration,
                message: 'Church registration created successfully'
            };

        } catch (error) {
            this.debug('Error creating church registration', error);
            
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
                    message: 'Church registration with this information already exists'
                };
            }

            return {
                success: false,
                error: error.message || 'Failed to create church registration',
                message: 'An error occurred while creating the church registration'
            };
        }
    }

    // Get all church registrations with optional filtering
    async getAllChurchRegistrations(filters = {}, options = {}) {
        try {
            this.debug('Fetching church registrations', { filters, options });

            const {
                page = 1,
                limit = 10,
                sortBy = 'createdAt',
                sortOrder = 'desc',
                ...queryFilters
            } = { ...filters, ...options };

            // Build query
            const query = {};
            
            // Filter by church name
            if (queryFilters.churchName) {
                query.churchName = { $regex: queryFilters.churchName, $options: 'i' };
            }

            // Filter by founder ID
            if (queryFilters.founderID) {
                query.founderID = { $regex: queryFilters.founderID, $options: 'i' };
            }

            // Filter by founder name
            if (queryFilters.founderName) {
                query.founderName = { $regex: queryFilters.founderName, $options: 'i' };
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
            const registrations = await ChurchRegistration
                .find(query)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .lean();

            // Get total count for pagination
            const totalCount = await ChurchRegistration.countDocuments(query);
            const totalPages = Math.ceil(totalCount / parseInt(limit));

            this.debug('Church registrations fetched successfully', {
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
                message: 'Church registrations fetched successfully'
            };

        } catch (error) {
            this.debug('Error fetching church registrations', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch church registrations',
                message: 'An error occurred while fetching church registrations'
            };
        }
    }

    // Get church registration by ID
    async getChurchRegistrationById(registrationId) {
        try {
            this.debug('Fetching church registration by ID', { registrationId });

            if (!registrationId) {
                return {
                    success: false,
                    error: 'Registration ID is required',
                    message: 'Please provide a valid registration ID'
                };
            }

            const registration = await ChurchRegistration.findById(registrationId);

            if (!registration) {
                return {
                    success: false,
                    error: 'Registration not found',
                    message: 'No church registration found with the provided ID'
                };
            }

            this.debug('Church registration found', { registrationId: registration._id });

            return {
                success: true,
                data: registration,
                message: 'Church registration fetched successfully'
            };

        } catch (error) {
            this.debug('Error fetching church registration by ID', error);
            
            if (error.name === 'CastError') {
                return {
                    success: false,
                    error: 'Invalid Registration ID',
                    message: 'Please provide a valid registration ID'
                };
            }

            return {
                success: false,
                error: error.message || 'Failed to fetch church registration',
                message: 'An error occurred while fetching the church registration'
            };
        }
    }

    // Update church registration
    async updateChurchRegistration(registrationId, updateData) {
        try {
            this.debug('Updating church registration', { 
                registrationId, 
                updateData 
            });

            const registration = await ChurchRegistration.findByIdAndUpdate(
                registrationId,
                updateData,
                { new: true, runValidators: true }
            );

            if (!registration) {
                return {
                    success: false,
                    error: 'Registration not found',
                    message: 'No church registration found with the provided ID'
                };
            }

            this.debug('Church registration updated successfully', {
                registrationId: registration._id
            });

            return {
                success: true,
                data: registration,
                message: 'Church registration updated successfully'
            };

        } catch (error) {
            this.debug('Error updating church registration', error);
            
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
                error: error.message || 'Failed to update church registration',
                message: 'An error occurred while updating the church registration'
            };
        }
    }

    // Delete church registration
    async deleteChurchRegistration(registrationId) {
        try {
            this.debug('Deleting church registration', { registrationId });

            const registration = await ChurchRegistration.findByIdAndDelete(registrationId);

            if (!registration) {
                return {
                    success: false,
                    error: 'Registration not found',
                    message: 'No church registration found with the provided ID'
                };
            }

            this.debug('Church registration deleted successfully', { registrationId });

            return {
                success: true,
                data: registration,
                message: 'Church registration deleted successfully'
            };

        } catch (error) {
            this.debug('Error deleting church registration', error);
            return {
                success: false,
                error: error.message || 'Failed to delete church registration',
                message: 'An error occurred while deleting the church registration'
            };
        }
    }

    // Get church registration statistics
    async getChurchRegistrationStats() {
        try {
            this.debug('Fetching church registration statistics');

            const stats = await ChurchRegistration.aggregate([
                {
                    $group: {
                        _id: null,
                        totalRegistrations: { $sum: 1 },
                        registrationsThisMonth: {
                            $sum: {
                                $cond: [
                                    {
                                        $gte: [
                                            '$createdAt',
                                            new Date(new Date().setDate(1))
                                        ]
                                    },
                                    1,
                                    0
                                ]
                            }
                        },
                        registrationsThisYear: {
                            $sum: {
                                $cond: [
                                    {
                                        $gte: [
                                            '$createdAt',
                                            new Date(new Date().getFullYear(), 0, 1)
                                        ]
                                    },
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                }
            ]);

            // Get registrations by month for the current year
            const monthlyStats = await ChurchRegistration.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(new Date().getFullYear(), 0, 1)
                        }
                    }
                },
                {
                    $group: {
                        _id: { $month: '$createdAt' },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            const result = {
                summary: stats[0] || {
                    totalRegistrations: 0,
                    registrationsThisMonth: 0,
                    registrationsThisYear: 0
                },
                monthlyStats: monthlyStats
            };

            this.debug('Church registration statistics fetched', result);

            return {
                success: true,
                data: result,
                message: 'Church registration statistics fetched successfully'
            };

        } catch (error) {
            this.debug('Error fetching church registration statistics', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch church registration statistics',
                message: 'An error occurred while fetching church registration statistics'
            };
        }
    }
    
    // Search church registrations
    async searchChurchRegistrations(searchTerm, filters = {}) {
        try {
            this.debug('Searching church registrations', { searchTerm, filters });
            
            const { page = 1, limit = 10 } = filters;
            const skip = (parseInt(page) - 1) * parseInt(limit);
            
            // Build search query
            const searchQuery = {
                $or: [
                    { churchName: { $regex: searchTerm, $options: 'i' } },
                    { founderID: { $regex: searchTerm, $options: 'i' } },
                    { founderName: { $regex: searchTerm, $options: 'i' } },
                    { founderContactNumber: { $regex: searchTerm, $options: 'i' } },
                    { chuchObjective: { $regex: searchTerm, $options: 'i' } }
                ]
            };
            
            // Execute search
            const registrations = await ChurchRegistration
                .find(searchQuery)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean();
                
            // Get total count for pagination
            const totalCount = await ChurchRegistration.countDocuments(searchQuery);
            const totalPages = Math.ceil(totalCount / parseInt(limit));
            
            this.debug('Church registrations search completed', {
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
                message: 'Church registrations search completed successfully'
            };
            
        } catch (error) {
            this.debug('Error searching church registrations', error);
            return {
                success: false,
                error: error.message || 'Failed to search church registrations',
                message: 'An error occurred while searching church registrations'
            };
        }
    }

    // Get church registrations by founder ID
    async getChurchRegistrationsByFounderId(founderId, filters = {}) {
        try {
            this.debug('Fetching church registrations by founder ID', { founderId, filters });

            const { page = 1, limit = 10 } = filters;
            const skip = (parseInt(page) - 1) * parseInt(limit);

            const query = { founderID: founderId };

            const registrations = await ChurchRegistration
                .find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean();

            const totalCount = await ChurchRegistration.countDocuments(query);
            const totalPages = Math.ceil(totalCount / parseInt(limit));

            this.debug('Church registrations by founder ID fetched successfully', {
                founderId,
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
                message: 'Church registrations by founder ID fetched successfully'
            };

        } catch (error) {
            this.debug('Error fetching church registrations by founder ID', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch church registrations by founder ID',
                message: 'An error occurred while fetching church registrations by founder ID'
            };
        }
    }
}

module.exports = ChurchRegistrationService;