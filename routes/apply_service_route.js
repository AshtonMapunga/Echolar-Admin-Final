const express = require('express');
const ApplicationServiceHandler = require('../service/apply_service_service.js');

const router = express.Router();
const applicationService = new ApplicationServiceHandler();

// Middleware to log all requests
router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// POST /api/applications - Create new application
router.post('/', async (req, res) => {
    try {
        console.log('Creating application with data:', req.body);
        
        const result = await applicationService.createApplication(req.body);
        
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
        console.error('Error in create application route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
        });
    }
});

// GET /api/applications - Get all applications with optional filtering and pagination
router.get('/', async (req, res) => {
    try {
        const {
            page,
            limit,
            sortBy,
            sortOrder,
            serviceType,
            status,
            applicantName,
            companyName,
            startDate,
            endDate
        } = req.query;

        const filters = {
            page,
            limit,
            sortBy,
            sortOrder,
            serviceType,
            status,
            applicantName,
            companyName,
            startDate,
            endDate
        };

        // Remove undefined values
        Object.keys(filters).forEach(key => 
            filters[key] === undefined && delete filters[key]
        );

        console.log('Fetching applications with filters:', filters);

        const result = await applicationService.getAllApplications(filters);

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
        console.error('Error in get applications route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
        });
    }
});

// GET /api/applications/stats - Get application statistics
router.get('/stats', async (req, res) => {
    try {
        console.log('Fetching application statistics');
        
        const result = await applicationService.getApplicationStats();

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
        console.error('Error in get application stats route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
        });
    }
});

// GET /api/applications/:id - Get application by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Fetching application by ID:', id);

        const result = await applicationService.getApplicationById(id);

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
        console.error('Error in get application by ID route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
        });
    }
});

// PUT /api/applications/:id/status - Update application status
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, ...updateData } = req.body;

        console.log('Updating application status:', { id, status, updateData });

        if (!status) {
            return res.status(400).json({
                success: false,
                error: 'Status is required',
                message: 'Please provide a status to update'
            });
        }

        const result = await applicationService.updateApplicationStatus(id, status, updateData);

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
        console.error('Error in update application status route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
        });
    }
});

// PUT /api/applications/:id - Update entire application
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        console.log('Updating application:', { id, updateData });

        // For now, we'll use the status update method with all data
        // You can create a separate updateApplication method if needed
        const { status = 'Pending', ...otherData } = updateData;
        
        const result = await applicationService.updateApplicationStatus(id, status, otherData);

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
        console.error('Error in update application route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
        });
    }
});

// DELETE /api/applications/:id - Delete application
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Deleting application:', id);

        const result = await applicationService.deleteApplication(id);

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
        console.error('Error in delete application route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
        });
    }
});

// POST /api/applications/bulk - Bulk operations (optional)
router.post('/bulk', async (req, res) => {
    try {
        const { operation, ids, data } = req.body;

        console.log('Bulk operation:', { operation, ids: ids?.length, data });

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
                    const result = await applicationService.updateApplicationStatus(id, data.status, data);
                    results.push({ id, result });
                }
                break;

            case 'delete':
                for (const id of ids) {
                    const result = await applicationService.deleteApplication(id);
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