const express = require('express');
const VendorNumberService = require('../service/vendor_num_apply_service');

const router = express.Router();
const vendorNumberService = new VendorNumberService();

// Middleware to log all requests
router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// POST /api/vendor-number - Create new vendor number application
router.post('/', async (req, res) => {
    try {
        console.log('Creating vendor number application with data:', req.body);
        
        const result = await vendorNumberService.createVendorNumberApplication(req.body);
        
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
        console.error('Error in create vendor number route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while creating the vendor number application'
        });
    }
});

// GET /api/vendor-number - Get all vendor number applications with optional filtering and pagination
router.get('/', async (req, res) => {
    try {
        const {
            page,
            limit,
            sortBy,
            sortOrder,
            status,
            applicantName,
            applicantEmail,
            businessName,
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
            applicantEmail,
            businessName,
            startDate,
            endDate
        };

        // Remove undefined values
        Object.keys(filters).forEach(key => 
            filters[key] === undefined && delete filters[key]
        );

        console.log('Fetching vendor number applications with filters:', filters);

        const result = await vendorNumberService.getAllVendorNumberApplications(filters);

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
        console.error('Error in get vendor number applications route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while fetching vendor number applications'
        });
    }
});

// GET /api/vendor-number/stats - Get vendor number application statistics
router.get('/stats', async (req, res) => {
    try {
        console.log('Fetching vendor number application statistics');
        
        const result = await vendorNumberService.getVendorNumberApplicationStats();

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
        console.error('Error in get vendor number stats route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while fetching statistics'
        });
    }
});

// GET /api/vendor-number/search - Search vendor number applications
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

        console.log('Searching vendor number applications with query:', q);

        const filters = { page, limit, status };
        Object.keys(filters).forEach(key => 
            filters[key] === undefined && delete filters[key]
        );

        const result = await vendorNumberService.searchVendorNumberApplications(q, filters);

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
        console.error('Error in search vendor number applications route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while searching applications'
        });
    }
});

// GET /api/vendor-number/:id - Get vendor number application by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Fetching vendor number application by ID:', id);

        const result = await vendorNumberService.getVendorNumberApplicationById(id);

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
        console.error('Error in get vendor number by ID route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while fetching the application'
        });
    }
});

// PUT /api/vendor-number/:id/status - Update vendor number application status
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, ...updateData } = req.body;

        console.log('Updating vendor number application status:', { id, status, updateData });

        if (!status) {
            return res.status(400).json({
                success: false,
                error: 'Status is required',
                message: 'Please provide a status to update'
            });
        }

        const result = await vendorNumberService.updateVendorNumberApplicationStatus(id, status, updateData);

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
        console.error('Error in update vendor number status route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while updating the application status'
        });
    }
});

// PUT /api/vendor-number/:id - Update entire vendor number application
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        console.log('Updating vendor number application:', { id, updateData });

        // For now, we'll use the status update method with all data
        const { status = 'Pending', ...otherData } = updateData;
        
        const result = await vendorNumberService.updateVendorNumberApplicationStatus(id, status, otherData);

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
        console.error('Error in update vendor number route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while updating the application'
        });
    }
});

// DELETE /api/vendor-number/:id - Delete vendor number application
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Deleting vendor number application:', id);

        const result = await vendorNumberService.deleteVendorNumberApplication(id);

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
        console.error('Error in delete vendor number route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while deleting the application'
        });
    }
});

// POST /api/vendor-number/bulk - Bulk operations
router.post('/bulk', async (req, res) => {
    try {
        const { operation, ids, data } = req.body;

        console.log('Bulk operation on vendor number applications:', { operation, ids: ids?.length, data });

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
                    const result = await vendorNumberService.updateVendorNumberApplicationStatus(id, data.status, data);
                    results.push({ id, result });
                }
                break;

            case 'delete':
                for (const id of ids) {
                    const result = await vendorNumberService.deleteVendorNumberApplication(id);
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