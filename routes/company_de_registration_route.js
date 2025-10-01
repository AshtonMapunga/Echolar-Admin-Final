// routes/companyDeregistration.js
const express = require('express');
const CompanyDeregistrationService = require('../service/company_de_registration_apply_service');

const router = express.Router();
const deregistrationService = new CompanyDeregistrationService();

// Middleware to log all requests
router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// POST /api/company-deregistrations - Create new company deregistration application
router.post('/', async (req, res) => {
    try {
        console.log('Creating company deregistration application with data:', req.body);
        
        const result = await deregistrationService.createDeregistrationApplication(req.body);
        
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
        console.error('Error in create company deregistration route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while creating the deregistration application'
        });
    }
});

// GET /api/company-deregistrations - Get all deregistration applications with optional filtering and pagination
router.get('/', async (req, res) => {
    try {
        const {
            page,
            limit,
            sortBy,
            sortOrder,
            status,
            applicantName,
            companyName,
            registrationNumber,
            hasOutstandingObligations,
            startDate,
            endDate
        } = req.query;

        const filters = {
            page,
            limit,
            sortBy,
            sortOrder,
            status,
            applicantName,
            companyName,
            registrationNumber,
            hasOutstandingObligations,
            startDate,
            endDate
        };

        // Remove undefined values
        Object.keys(filters).forEach(key => 
            filters[key] === undefined && delete filters[key]
        );

        console.log('Fetching company deregistration applications with filters:', filters);

        const result = await deregistrationService.getAllDeregistrationApplications(filters);

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
        console.error('Error in get company deregistration applications route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while fetching deregistration applications'
        });
    }
});

// GET /api/company-deregistrations/stats - Get deregistration application statistics
router.get('/stats', async (req, res) => {
    try {
        console.log('Fetching company deregistration application statistics');
        
        const result = await deregistrationService.getDeregistrationApplicationStats();

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
        console.error('Error in get company deregistration stats route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while fetching statistics'
        });
    }
});

// GET /api/company-deregistrations/search - Search deregistration applications
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

        console.log('Searching company deregistration applications with query:', q);

        const filters = { page, limit, status };
        Object.keys(filters).forEach(key => 
            filters[key] === undefined && delete filters[key]
        );

        const result = await deregistrationService.searchDeregistrationApplications(q, filters);

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
        console.error('Error in search company deregistration applications route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while searching applications'
        });
    }
});

// GET /api/company-deregistrations/:id - Get deregistration application by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Fetching company deregistration application by ID:', id);

        const result = await deregistrationService.getDeregistrationApplicationById(id);

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
        console.error('Error in get company deregistration by ID route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while fetching the application'
        });
    }
});

// PUT /api/company-deregistrations/:id/status - Update deregistration application status
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, ...updateData } = req.body;

        console.log('Updating company deregistration application status:', { id, status, updateData });

        if (!status) {
            return res.status(400).json({
                success: false,
                error: 'Status is required',
                message: 'Please provide a status to update'
            });
        }

        const result = await deregistrationService.updateDeregistrationApplicationStatus(id, status, updateData);

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
        console.error('Error in update company deregistration status route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while updating the application status'
        });
    }
});

// PUT /api/company-deregistrations/:id - Update entire deregistration application
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        console.log('Updating company deregistration application:', { id, updateData });

        // For now, we'll use the status update method with all data
        // You can create a separate updateDeregistrationApplication method if needed
        const { status = 'Pending', ...otherData } = updateData;
        
        const result = await deregistrationService.updateDeregistrationApplicationStatus(id, status, otherData);

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
        console.error('Error in update company deregistration route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while updating the application'
        });
    }
});

// DELETE /api/company-deregistrations/:id - Delete deregistration application
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Deleting company deregistration application:', id);

        const result = await deregistrationService.deleteDeregistrationApplication(id);

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
        console.error('Error in delete company deregistration route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while deleting the application'
        });
    }
});

// POST /api/company-deregistrations/bulk - Bulk operations
router.post('/bulk', async (req, res) => {
    try {
        const { operation, ids, data } = req.body;

        console.log('Bulk operation on company deregistration applications:', { operation, ids: ids?.length, data });

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
                    const result = await deregistrationService.updateDeregistrationApplicationStatus(id, data.status, data);
                    results.push({ id, result });
                }
                break;

            case 'delete':
                for (const id of ids) {
                    const result = await deregistrationService.deleteDeregistrationApplication(id);
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