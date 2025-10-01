const express = require('express');
const LicenceRegistrationService = require('../service/licence_service');

const router = express.Router();
const licenceService = new LicenceRegistrationService();

// Middleware to log all requests
router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// POST /api/licence-registrations - Create new licence registration application
router.post('/', async (req, res) => {
    try {
        console.log('Creating licence registration application with data:', req.body);
        
        const result = await licenceService.createLicenceApplication(req.body);
        
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
        console.error('Error in create licence registration route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while creating the licence application'
        });
    }
});

// GET /api/licence-registrations - Get all licence applications with optional filtering and pagination
router.get('/', async (req, res) => {
    try {
        const {
            page,
            limit,
            sortBy,
            sortOrder,
            status,
            companyName,
            contactPerson,
            businessType,
            email,
            startDate,
            endDate
        } = req.query;

        const filters = {
            page,
            limit,
            sortBy,
            sortOrder,
            status,
            companyName,
            contactPerson,
            businessType,
            email,
            startDate,
            endDate
        };

        // Remove undefined values
        Object.keys(filters).forEach(key => 
            filters[key] === undefined && delete filters[key]
        );

        console.log('Fetching licence registration applications with filters:', filters);

        const result = await licenceService.getAllLicenceApplications(filters);

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
        console.error('Error in get licence registration applications route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while fetching licence applications'
        });
    }
});

// GET /api/licence-registrations/stats - Get licence application statistics
router.get('/stats', async (req, res) => {
    try {
        console.log('Fetching licence registration application statistics');
        
        const result = await licenceService.getLicenceApplicationStats();

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
        console.error('Error in get licence registration stats route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while fetching statistics'
        });
    }
});

// GET /api/licence-registrations/search - Search licence applications
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

        console.log('Searching licence registration applications with query:', q);

        const filters = { page, limit, status };
        Object.keys(filters).forEach(key => 
            filters[key] === undefined && delete filters[key]
        );

        const result = await licenceService.searchLicenceApplications(q, filters);

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
        console.error('Error in search licence registration applications route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while searching applications'
        });
    }
});

// GET /api/licence-registrations/:id - Get licence application by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Fetching licence registration application by ID:', id);

        const result = await licenceService.getLicenceApplicationById(id);

        if (result.success) {
            return res.status(200).json({
                success: true,
                message: result.message,
                data: result.data
            });
        } else {
            const statusCode = result.error === 'Application not found' ? 404 : 400;
            return res.status(statusCode).json({
                success: false,
                error: result.error,
                message: result.message
            });
        }
    } catch (error) {
        console.error('Error in get licence registration by ID route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while fetching the application'
        });
    }
});

router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, ...updateData } = req.body;

        console.log('Updating licence registration application status:', { id, status, updateData });

        if (!status) {
            return res.status(400).json({
                success: false,
                error: 'Status is required',
                message: 'Please provide a status to update'
            });
        }

        const result = await licenceService.updateLicenceApplicationStatus(id, status, updateData);

        if (result.success) {
            const response = {
                success: true,
                message: result.message,
                data: result.data
            };

            // Include notification status if applicable
            if (status === "Approved" && result.notification) {
                response.notification = result.notification;
            }

            return res.status(200).json(response);
        } else {
            const statusCode = result.error === 'Application not found' ? 404 : 400;
            return res.status(statusCode).json({
                success: false,
                error: result.error,
                message: result.message
            });
        }
    } catch (error) {
        console.error('Error in update licence registration status route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while updating the application status'
        });
    }
});

// PUT /api/licence-registrations/:id - Update entire licence application
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        console.log('Updating licence registration application:', { id, updateData });

        const result = await licenceService.updateLicenceApplication(id, updateData);

        if (result.success) {
            return res.status(200).json({
                success: true,
                message: result.message,
                data: result.data
            });
        } else {
            const statusCode = result.error === 'Application not found' ? 404 : 400;
            return res.status(statusCode).json({
                success: false,
                error: result.error,
                message: result.message
            });
        }
    } catch (error) {
        console.error('Error in update licence registration route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while updating the application'
        });
    }
});

// DELETE /api/licence-registrations/:id - Delete licence application
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Deleting licence registration application:', id);

        const result = await licenceService.deleteLicenceApplication(id);

        if (result.success) {
            return res.status(200).json({
                success: true,
                message: result.message,
                data: result.data
            });
        } else {
            const statusCode = result.error === 'Application not found' ? 404 : 400;
            return res.status(statusCode).json({
                success: false,
                error: result.error,
                message: result.message
            });
        }
    } catch (error) {
        console.error('Error in delete licence registration route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while deleting the application'
        });
    }
});

// POST /api/licence-registrations/bulk - Bulk operations
router.post('/bulk', async (req, res) => {
    try {
        const { operation, ids, data } = req.body;

        console.log('Bulk operation on licence registration applications:', { operation, ids: ids?.length, data });

        if (!operation || !ids || !Array.isArray(ids)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid bulk operation',
                message: 'Operation and IDs array are required'
            });
        }

        const results = [];
        
        switch (operation) {
            case 'updateStatus':
                if (!data?.status) {
                    return res.status(400).json({
                        success: false,
                        error: 'Status is required for bulk status update',
                        message: 'Please provide a status'
                    });
                }

                for (const id of ids) {
                    const result = await licenceService.updateLicenceApplicationStatus(id, data.status, data);
                    results.push({ id, result });
                }
                break;

            case 'delete':
                for (const id of ids) {
                    const result = await licenceService.deleteLicenceApplication(id);
                    results.push({ id, result });
                }
                break;

            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid operation',
                    message: 'Supported operations: updateStatus, delete'
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