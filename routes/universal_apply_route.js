const express = require('express');
const UniversalApplyService = require('../service/universal_apply_service');

const router = express.Router();
const universalApplyService = new UniversalApplyService();

// Middleware to log all requests
router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// POST /api/universal-applications - Create new universal application
router.post('/', async (req, res) => {
    try {
        console.log('Creating universal application with data:', req.body);
        
        const result = await universalApplyService.createUniversalApplication(req.body);
        
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
        console.error('Error in create universal application route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while creating the application'
        });
    }
});

// GET /api/universal-applications - Get all applications with optional filtering and pagination
router.get('/', async (req, res) => {
    try {
        const {
            page,
            limit,
            sortBy,
            sortOrder,
            companyName,
            contactName,
            email,
            startDate,
            endDate
        } = req.query;

        const filters = {
            page,
            limit,
            sortBy,
            sortOrder,
            companyName,
            contactName,
            email,
            startDate,
            endDate
        };

        // Remove undefined values
        Object.keys(filters).forEach(key => 
            filters[key] === undefined && delete filters[key]
        );

        console.log('Fetching universal applications with filters:', filters);

        const result = await universalApplyService.getAllUniversalApplications(filters);

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
        console.error('Error in get universal applications route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while fetching applications'
        });
    }
});

// GET /api/universal-applications/stats - Get application statistics
router.get('/stats', async (req, res) => {
    try {
        console.log('Fetching universal application statistics');
        
        const result = await universalApplyService.getUniversalApplicationStats();

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
        console.error('Error in get universal application stats route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while fetching statistics'
        });
    }
});

// GET /api/universal-applications/search - Search applications
router.get('/search', async (req, res) => {
    try {
        const { q, page, limit } = req.query;
        
        if (!q) {
            return res.status(400).json({
                success: false,
                error: 'Search query is required',
                message: 'Please provide a search query parameter (q)'
            });
        }

        console.log('Searching universal applications with query:', q);

        const filters = { page, limit };
        Object.keys(filters).forEach(key => 
            filters[key] === undefined && delete filters[key]
        );

        const result = await universalApplyService.searchUniversalApplications(q, filters);

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
        console.error('Error in search universal applications route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while searching applications'
        });
    }
});

// GET /api/universal-applications/:id - Get application by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Fetching universal application by ID:', id);

        const result = await universalApplyService.getUniversalApplicationById(id);

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
        console.error('Error in get universal application by ID route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while fetching the application'
        });
    }
});

// PUT /api/universal-applications/:id - Update entire application
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        console.log('Updating universal application:', { id, updateData });

        const result = await universalApplyService.updateUniversalApplication(id, updateData);

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
        console.error('Error in update universal application route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while updating the application'
        });
    }
});

// DELETE /api/universal-applications/:id - Delete application
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Deleting universal application:', id);

        const result = await universalApplyService.deleteUniversalApplication(id);

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
        console.error('Error in delete universal application route:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while deleting the application'
        });
    }
});

module.exports = router;