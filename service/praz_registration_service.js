const PrazRegistration = require("../models/praz_reg_apply_model");

class PrazRegistrationService {
    constructor() {
        this.debug = this.debug.bind(this);
    }

    // Debug function
    debug(message, data = null) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] PRAZ_REGISTRATION_SERVICE: ${message}`);
        if (data) {
            console.log(`[${timestamp}] DATA:`, JSON.stringify(data, null, 2));
        }
    }

    // Create new PRAZ registration application
    async createPrazRegistration(registrationData) {
        try {
            this.debug('Creating new PRAZ registration application', registrationData);

            // Validate required fields
            const requiredFields = [
                'bankName', 
                'companyEmail', 
                'accountNumber',
                'accountHolder',
                'branchCode',
                'accountType',
                'branchName'
            ];
            
            const missingFields = requiredFields.filter(field => !registrationData[field]);

            if (missingFields.length > 0) {
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }

            // Validate email format
            const emailRegex = /\S+@\S+\.\S+/;
            if (!emailRegex.test(registrationData.companyEmail)) {
                throw new Error('Invalid email format');
            }

            // Validate account number (basic validation)
            if (!/^\d+$/.test(registrationData.accountNumber)) {
                throw new Error('Account number must contain only numbers');
            }

            // Create the registration
            const registration = new PrazRegistration({
                bankName: registrationData.bankName.trim(),
                companyEmail: registrationData.companyEmail.toLowerCase().trim(),
                accountNumber: registrationData.accountNumber.trim(),
                accountHolder: registrationData.accountHolder.trim(),
                branchCode: registrationData.branchCode.trim(),
                accountType: registrationData.accountType.trim(),
                branchName: registrationData.branchName.trim()
            });

            const savedRegistration = await registration.save();
            this.debug('PRAZ registration application created successfully', { 
                registrationId: savedRegistration._id 
            });

            return {
                success: true,
                data: savedRegistration,
                message: 'PRAZ registration application created successfully'
            };

        } catch (error) {
            this.debug('Error creating PRAZ registration application', error);
            
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
                    message: 'PRAZ registration with this information already exists'
                };
            }

            return {
                success: false,
                error: error.message || 'Failed to create PRAZ registration',
                message: 'An error occurred while creating the PRAZ registration'
            };
        }
    }

    // Get all PRAZ registrations with optional filtering
    async getAllPrazRegistrations(filters = {}, options = {}) {
        try {
            this.debug('Fetching PRAZ registration applications', { filters, options });

            const {
                page = 1,
                limit = 10,
                sortBy = 'createdAt',
                sortOrder = 'desc',
                ...queryFilters
            } = { ...filters, ...options };

            // Build query
            const query = {};
            
            // Filter by bank name
            if (queryFilters.bankName) {
                query.bankName = { $regex: queryFilters.bankName, $options: 'i' };
            }

            // Filter by company email
            if (queryFilters.companyEmail) {
                query.companyEmail = { $regex: queryFilters.companyEmail, $options: 'i' };
            }

            // Filter by account holder
            if (queryFilters.accountHolder) {
                query.accountHolder = { $regex: queryFilters.accountHolder, $options: 'i' };
            }
            
            // Filter by branch name
            if (queryFilters.branchName) {
                query.branchName = { $regex: queryFilters.branchName, $options: 'i' };
            }
            
            // Filter by account type
            if (queryFilters.accountType) {
                query.accountType = queryFilters.accountType;
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
            const registrations = await PrazRegistration
                .find(query)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .lean();

            // Get total count for pagination
            const totalCount = await PrazRegistration.countDocuments(query);
            const totalPages = Math.ceil(totalCount / parseInt(limit));

            this.debug('PRAZ registration applications fetched successfully', {
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
                message: 'PRAZ registration applications fetched successfully'
            };

        } catch (error) {
            this.debug('Error fetching PRAZ registration applications', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch PRAZ registrations',
                message: 'An error occurred while fetching PRAZ registrations'
            };
        }
    }

    // Get PRAZ registration by ID
    async getPrazRegistrationById(registrationId) {
        try {
            this.debug('Fetching PRAZ registration application by ID', { registrationId });

            if (!registrationId) {
                return {
                    success: false,
                    error: 'Registration ID is required',
                    message: 'Please provide a valid registration ID'
                };
            }

            const registration = await PrazRegistration.findById(registrationId);

            if (!registration) {
                return {
                    success: false,
                    error: 'Registration not found',
                    message: 'No PRAZ registration found with the provided ID'
                };
            }

            this.debug('PRAZ registration application found', { registrationId: registration._id });

            return {
                success: true,
                data: registration,
                message: 'PRAZ registration application fetched successfully'
            };

        } catch (error) {
            this.debug('Error fetching PRAZ registration application by ID', error);
            
            if (error.name === 'CastError') {
                return {
                    success: false,
                    error: 'Invalid Registration ID',
                    message: 'Please provide a valid registration ID'
                };
            }

            return {
                success: false,
                error: error.message || 'Failed to fetch PRAZ registration',
                message: 'An error occurred while fetching the PRAZ registration'
            };
        }
    }

    // Update PRAZ registration
    async updatePrazRegistration(registrationId, updateData = {}) {
        try {
            this.debug('Updating PRAZ registration application', { 
                registrationId, 
                updateData 
            });

            // Validate email format if email is being updated
            if (updateData.companyEmail) {
                const emailRegex = /\S+@\S+\.\S+/;
                if (!emailRegex.test(updateData.companyEmail)) {
                    return {
                        success: false,
                        error: 'Invalid email format',
                        message: 'Please provide a valid email address'
                    };
                }
                updateData.companyEmail = updateData.companyEmail.toLowerCase().trim();
            }

            // Validate account number if being updated
            if (updateData.accountNumber && !/^\d+$/.test(updateData.accountNumber)) {
                return {
                    success: false,
                    error: 'Invalid account number',
                    message: 'Account number must contain only numbers'
                };
            }

            const registration = await PrazRegistration.findByIdAndUpdate(
                registrationId,
                updateData,
                { new: true, runValidators: true }
            );

            if (!registration) {
                return {
                    success: false,
                    error: 'Registration not found',
                    message: 'No PRAZ registration found with the provided ID'
                };
            }

            this.debug('PRAZ registration application updated successfully', {
                registrationId: registration._id
            });

            return {
                success: true,
                data: registration,
                message: 'PRAZ registration application updated successfully'
            };

        } catch (error) {
            this.debug('Error updating PRAZ registration application', error);
            
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
                error: error.message || 'Failed to update PRAZ registration',
                message: 'An error occurred while updating the PRAZ registration'
            };
        }
    }

    // Delete PRAZ registration
    async deletePrazRegistration(registrationId) {
        try {
            this.debug('Deleting PRAZ registration application', { registrationId });

            const registration = await PrazRegistration.findByIdAndDelete(registrationId);

            if (!registration) {
                return {
                    success: false,
                    error: 'Registration not found',
                    message: 'No PRAZ registration found with the provided ID'
                };
            }

            this.debug('PRAZ registration application deleted successfully', { registrationId });

            return {
                success: true,
                data: registration,
                message: 'PRAZ registration application deleted successfully'
            };

        } catch (error) {
            this.debug('Error deleting PRAZ registration application', error);
            return {
                success: false,
                error: error.message || 'Failed to delete PRAZ registration',
                message: 'An error occurred while deleting the PRAZ registration'
            };
        }
    }

    // Get PRAZ registration statistics
    async getPrazRegistrationStats() {
        try {
            this.debug('Fetching PRAZ registration application statistics');

            const stats = await PrazRegistration.aggregate([
                {
                    $group: {
                        _id: null,
                        totalRegistrations: { $sum: 1 },
                        uniqueBanks: { $addToSet: '$bankName' }
                    }
                },
                {
                    $project: {
                        totalRegistrations: 1,
                        uniqueBankCount: { $size: '$uniqueBanks' }
                    }
                }
            ]);

            // Get registrations by bank
            const bankStats = await PrazRegistration.aggregate([
                {
                    $group: {
                        _id: '$bankName',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } }
            ]);

            // Get registrations by account type
            const accountTypeStats = await PrazRegistration.aggregate([
                {
                    $group: {
                        _id: '$accountType',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } }
            ]);

            const result = {
                summary: stats[0] || {
                    totalRegistrations: 0,
                    uniqueBankCount: 0
                },
                banks: bankStats,
                accountTypes: accountTypeStats
            };

            this.debug('PRAZ registration application statistics fetched', result);

            return {
                success: true,
                data: result,
                message: 'PRAZ registration application statistics fetched successfully'
            };

        } catch (error) {
            this.debug('Error fetching PRAZ registration application statistics', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch PRAZ registration statistics',
                message: 'An error occurred while fetching PRAZ registration statistics'
            };
        }
    }
    
    // Search PRAZ registrations
    async searchPrazRegistrations(searchTerm, filters = {}) {
        try {
            this.debug('Searching PRAZ registration applications', { searchTerm, filters });
            
            const { page = 1, limit = 10 } = filters;
            const skip = (parseInt(page) - 1) * parseInt(limit);
            
            // Build search query
            const searchQuery = {
                $or: [
                    { bankName: { $regex: searchTerm, $options: 'i' } },
                    { companyEmail: { $regex: searchTerm, $options: 'i' } },
                    { accountHolder: { $regex: searchTerm, $options: 'i' } },
                    { accountNumber: { $regex: searchTerm, $options: 'i' } },
                    { branchName: { $regex: searchTerm, $options: 'i' } },
                    { branchCode: { $regex: searchTerm, $options: 'i' } }
                ]
            };
            
            // Add account type filter if provided
            if (filters.accountType) {
                searchQuery.accountType = filters.accountType;
            }
            
            // Execute search
            const registrations = await PrazRegistration
                .find(searchQuery)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean();
                
            // Get total count for pagination
            const totalCount = await PrazRegistration.countDocuments(searchQuery);
            const totalPages = Math.ceil(totalCount / parseInt(limit));
            
            this.debug('PRAZ registration applications search completed', {
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
                message: 'PRAZ registration applications search completed successfully'
            };
            
        } catch (error) {
            this.debug('Error searching PRAZ registration applications', error);
            return {
                success: false,
                error: error.message || 'Failed to search PRAZ registrations',
                message: 'An error occurred while searching PRAZ registrations'
            };
        }
    }
}

module.exports = PrazRegistrationService;