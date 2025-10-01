const express = require('express');
const CollegeRegistrationService = require('../service/colege_re_serv');

const router = express.Router();
const collegeRegistrationService = new CollegeRegistrationService();

// Middleware to log all requests
router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// POST /api/college-registrations - Create new college registration application
router.post('/', async (req, res) => {
    try {
        console.log('Creating college registration application with data:', req.body);
        
        const result = await collegeRegistrationService.createCollegeRegistration(req.body);
        
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
        console.error('Error in create college registration route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while creating the college registration'
        });
    }
});

// GET /api/college-registrations - Get all college registrations with optional filtering and pagination
router.get('/', async (req, res) => {
    try {
        const {
            page,
            limit,
            sortBy,
            sortOrder,
            applicantName,
            churchName,
            email,
            phoneNumber,
            status,
            startDate,
            endDate
        } = req.query;

        const filters = {
            page,
            limit,
            sortBy,
            sortOrder,
            applicantName,
            churchName,
            email,
            phoneNumber,
            status,
            startDate,
            endDate
        };

        // Remove undefined values
        Object.keys(filters).forEach(key => 
            filters[key] === undefined && delete filters[key]
        );

        console.log('Fetching college registration applications with filters:', filters);

        const result = await collegeRegistrationService.getAllCollegeRegistrations(filters);

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
        console.error('Error in get college registration applications route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while fetching college registrations'
        });
    }
});

// GET /api/college-registrations/stats - Get college registration statistics
router.get('/stats', async (req, res) => {
    try {
        console.log('Fetching college registration application statistics');
        
        const result = await collegeRegistrationService.getCollegeRegistrationStats();

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
        console.error('Error in get college registration stats route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while fetching statistics'
        });
    }
});

// GET /api/college-registrations/search - Search college registrations
router.get('/search', async (req, res) => {
    try {
        const { q, page, limit, status } = req.query;
        
        if (!q) {
            return res.status(400).json({
                success: false,
                error: 'Search query is required',
                message: 'Please provide a search query parameter (q)'
            });
        }

        console.log('Searching college registration applications with query:', q);

        const filters = { page, limit, status };
        Object.keys(filters).forEach(key => 
            filters[key] === undefined && delete filters[key]
        );

        const result = await collegeRegistrationService.searchCollegeRegistrations(q, filters);

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
        console.error('Error in search college registration applications route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while searching applications'
        });
    }
});

// GET /api/college-registrations/:id - Get college registration by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Fetching college registration application by ID:', id);

        const result = await collegeRegistrationService.getCollegeRegistrationById(id);

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
        console.error('Error in get college registration by ID route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while fetching the registration'
        });
    }
});

// PUT /api/college-registrations/:id - Update college registration
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        console.log('Updating college registration application:', { id, updateData });

        const result = await collegeRegistrationService.updateCollegeRegistration(id, updateData);

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
        console.error('Error in update college registration route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while updating the registration'
        });
    }
});

// DELETE /api/college-registrations/:id - Delete college registration
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Deleting college registration application:', id);

        const result = await collegeRegistrationService.deleteCollegeRegistration(id);

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
        console.error('Error in delete college registration route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while deleting the registration'
        });
    }
});

// POST /api/college-registrations/bulk - Bulk operations
router.post('/bulk', async (req, res) => {
    try {
        const { operation, ids, data } = req.body;

        console.log('Bulk operation on college registration applications:', { operation, ids: ids?.length, data });

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
                    const result = await collegeRegistrationService.updateCollegeRegistration(id, data);
                    results.push({ id, result });
                }
                break;

            case 'delete':
                for (const id of ids) {
                    const result = await collegeRegistrationService.deleteCollegeRegistration(id);
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