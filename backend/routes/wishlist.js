const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { auth } = require('../middleware/auth');
const { handleError } = require('../utils/errorHandler');
const { success } = require('../utils/response');

// Get wishlist
router.get('/', auth, async (req, res) => {
    try {
        const [items] = await pool.query(`
            SELECT w.*, p.name, p.price, p.image_url
            FROM wishlists w
            JOIN products p ON w.product_id = p.id
            WHERE w.user_id = ?
            ORDER BY w.created_at DESC
        `, [req.user.id]);

        success(res, { wishlist: items });
    } catch (error) {
        handleError(res, error, 'Get wishlist error');
    }
});

// Add to wishlist
router.post('/add', auth, async (req, res) => {
    try {
        const { product_id } = req.body;

        await pool.query(`
            INSERT IGNORE INTO wishlists (user_id, product_id) VALUES (?, ?)
        `, [req.user.id, product_id]);

        success(res, null, 'Added to wishlist');
    } catch (error) {
        handleError(res, error, 'Add to wishlist error');
    }
});

// Remove from wishlist
router.delete('/remove/:product_id', auth, async (req, res) => {
    try {
        await pool.query('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?', [req.user.id, req.params.product_id]);
        success(res, null, 'Removed from wishlist');
    } catch (error) {
        handleError(res, error, 'Remove from wishlist error');
    }
});

module.exports = router;