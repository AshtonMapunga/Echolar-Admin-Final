const express = require('express');
const PrazRegistrationService = require('../service/praz_registration_service');

const router = express.Router();
const prazRegistrationService = new PrazRegistrationService();

// Middleware to log all requests
router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// POST /api/praz-registrations - Create new PRAZ registration application
router.post('/', async (req, res) => {
    try {
        console.log('Creating PRAZ registration application with data:', req.body);
        
        const result = await prazRegistrationService.createPrazRegistration(req.body);
        
        if (result.success) {
            return res.status(201).json({
                success: true,
                message: result.message,
                data: result.data
            });
        } else {
            return res.status(400).json({
                success: false,
                error: result.error,
                message: result.message,
                details: result.details
            });
        }
    } catch (error) {
        console.error('Error in create PRAZ registration route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while creating the PRAZ registration'
        });
    }
});

// GET /api/praz-registrations - Get all PRAZ registrations with optional filtering and pagination
router.get('/', async (req, res) => {
    try {
        const {
            page,
            limit,
            sortBy,
            sortOrder,
            bankName,
            companyEmail,
            accountHolder,
            branchName,
            accountType,
            startDate,
            endDate
        } = req.query;

        const filters = {
            page,
            limit,
            sortBy,
            sortOrder,
            bankName,
            companyEmail,
            accountHolder,
            branchName,
            accountType,
            startDate,
            endDate
        };

        // Remove undefined values
        Object.keys(filters).forEach(key => 
            filters[key] === undefined && delete filters[key]
        );

        console.log('Fetching PRAZ registration applications with filters:', filters);

        const result = await prazRegistrationService.getAllPrazRegistrations(filters);

        if (result.success) {
            return res.status(200).json({
                success: true,
                message: result.message,
                data: result.data,
                pagination: result.pagination
            });
        } else {
            return res.status(400).json({
                success: false,
                error: result.error,
                message: result.message
            });
        }
    } catch (error) {
        console.error('Error in get PRAZ registration applications route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while fetching PRAZ registrations'
        });
    }
});

// GET /api/praz-registrations/stats - Get PRAZ registration statistics
router.get('/stats', async (req, res) => {
    try {
        console.log('Fetching PRAZ registration application statistics');
        
        const result = await prazRegistrationService.getPrazRegistrationStats();

        if (result.success) {
            return res.status(200).json({
                success: true,
                message: result.message,
                data: result.data
            });
        } else {
            return res.status(400).json({
                success: false,
                error: result.error,
                message: result.message
            });
        }
    } catch (error) {
        console.error('Error in get PRAZ registration stats route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while fetching statistics'
        });
    }
});

// GET /api/praz-registrations/search - Search PRAZ registrations
router.get('/search', async (req, res) => {
    try {
        const { q, page, limit, accountType } = req.query;
        
        if (!q) {
            return res.status(400).json({
                success: false,
                error: 'Search query is required',
                message: 'Please provide a search query parameter (q)'
            });
        }

        console.log('Searching PRAZ registration applications with query:', q);

        const filters = { page, limit, accountType };
        Object.keys(filters).forEach(key => 
            filters[key] === undefined && delete filters[key]
        );

        const result = await prazRegistrationService.searchPrazRegistrations(q, filters);

        if (result.success) {
            return res.status(200).json({
                success: true,
                message: result.message,
                data: result.data,
                pagination: result.pagination
            });
        } else {
            return res.status(400).json({
                success: false,
                error: result.error,
                message: result.message
            });
        }
    } catch (error) {
        console.error('Error in search PRAZ registration applications route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while searching applications'
        });
    }
});

// GET /api/praz-registrations/:id - Get PRAZ registration by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Fetching PRAZ registration application by ID:', id);

        const result = await prazRegistrationService.getPrazRegistrationById(id);

        if (result.success) {
            return res.status(200).json({
                success: true,
                message: result.message,
                data: result.data
            });
        } else {
            const statusCode = result.error === 'Registration not found' ? 404 : 400;
            return res.status(statusCode).json({
                success: false,
                error: result.error,
                message: result.message
            });
        }
    } catch (error) {
        console.error('Error in get PRAZ registration by ID route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while fetching the registration'
        });
    }
});

// PUT /api/praz-registrations/:id - Update PRAZ registration
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        console.log('Updating PRAZ registration application:', { id, updateData });

        const result = await prazRegistrationService.updatePrazRegistration(id, updateData);

        if (result.success) {
            return res.status(200).json({
                success: true,
                message: result.message,
                data: result.data
            });
        } else {
            const statusCode = result.error === 'Registration not found' ? 404 : 400;
            return res.status(statusCode).json({
                success: false,
                error: result.error,
                message: result.message
            });
        }
    } catch (error) {
        console.error('Error in update PRAZ registration route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while updating the registration'
        });
    }
});

// DELETE /api/praz-registrations/:id - Delete PRAZ registration
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Deleting PRAZ registration application:', id);

        const result = await prazRegistrationService.deletePrazRegistration(id);

        if (result.success) {
            return res.status(200).json({
                success: true,
                message: result.message,
                data: result.data
            });
        } else {
            const statusCode = result.error === 'Registration not found' ? 404 : 400;
            return res.status(statusCode).json({
                success: false,
                error: result.error,
                message: result.message
            });
        }
    } catch (error) {
        console.error('Error in delete PRAZ registration route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while deleting the registration'
        });
    }
});

// POST /api/praz-registrations/bulk - Bulk operations
router.post('/bulk', async (req, res) => {
    try {
        const { operation, ids, data } = req.body;

        console.log('Bulk operation on PRAZ registration applications:', { operation, ids: ids?.length, data });

        if (!operation || !ids || !Array.isArray(ids)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid bulk operation',
                message: 'Operation and IDs array are required'
            });
        }

        const results = [];
        
        switch (operation) {
            case 'update':
                for (const id of ids) {
                    const result = await prazRegistrationService.updatePrazRegistration(id, data);
                    results.push({ id, result });
                }
                break;

            case 'delete':
                for (const id of ids) {
                    const result = await prazRegistrationService.deletePrazRegistration(id);
                    results.push({ id, result });
                }
                break;

            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid operation',
                    message: 'Supported operations: update, delete'
                });
        }

        const successCount = results.filter(r => r.result.success).length;
        const errorCount = results.length - successCount;

        return res.status(200).json({
            success: true,
            message: `Bulk operation completed: ${successCount} successful, ${errorCount} failed`,
            data: {
                operation,
                totalCount: results.length,
                successCount,
                errorCount,
                results: results
            }
        });

    } catch (error) {
        console.error('Error in bulk operation route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred during bulk operation'
        });
    }
});

module.exports = router;