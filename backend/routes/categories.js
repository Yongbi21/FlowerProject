const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { handleError } = require('../utils/errorHandler');
const { success } = require('../utils/response');

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
    try {
        const [categories] = await pool.query(`
            SELECT c.*, COUNT(p.id) as product_count
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id AND p.is_active = TRUE
            GROUP BY c.id
            ORDER BY c.name
        `);

        success(res, { categories });
    } catch (error) {
        handleError(res, error, 'Get categories error');
    }
});

module.exports = router;
