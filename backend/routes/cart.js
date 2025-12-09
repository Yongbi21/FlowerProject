const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { auth } = require('../middleware/auth');
const { handleError, notFound, badRequest } = require('../utils/errorHandler');
const { success } = require('../utils/response');
const { requirePositive } = require('../utils/validation');

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const [items] = await pool.query(`
            SELECT 
                ci.id,
                ci.product_id,
                ci.quantity,
                ci.customization,
                ci.created_at,
                p.name,
                p.price,
                p.image_url,
                p.stock_quantity,
                p.is_active,
                (p.price * ci.quantity) as subtotal
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.user_id = ?
            ORDER BY ci.created_at DESC
        `, [req.user.id]);

        // Calculate totals
        const subtotal = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

        success(res, { cart: { items, subtotal, itemCount } });
    } catch (error) {
        handleError(res, error, 'Get cart error');
    }
});

// @route   POST /api/cart/add
// @desc    Add item to cart
// @access  Private
router.post('/add', auth, async (req, res) => {
    try {
        const { product_id, quantity = 1, customization } = req.body;

        if (!product_id) {
            return badRequest(res, 'Product ID is required');
        }

        // Check if product exists and is active
        const [products] = await pool.query(
            'SELECT id, name, stock_quantity, is_active FROM products WHERE id = ?',
            [product_id]
        );

        if (products.length === 0) {
            return notFound(res, 'Product not found');
        }

        if (!products[0].is_active) {
            return badRequest(res, 'Product is not available');
        }

        // Check stock
        if (products[0].stock_quantity < quantity) {
            return badRequest(res, 'Insufficient stock');
        }

        // Add or update cart item
        await pool.query(`
            INSERT INTO cart_items (user_id, product_id, quantity, customization)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                quantity = quantity + VALUES(quantity),
                customization = COALESCE(VALUES(customization), customization),
                updated_at = CURRENT_TIMESTAMP
        `, [req.user.id, product_id, quantity, customization ? JSON.stringify(customization) : null]);

        // Get updated cart count
        const [countResult] = await pool.query(
            'SELECT SUM(quantity) as count FROM cart_items WHERE user_id = ?',
            [req.user.id]
        );

        success(res, { cartCount: countResult[0].count || 0 }, 'Added to cart');
    } catch (error) {
        handleError(res, error, 'Add to cart error');
    }
});

// @route   PUT /api/cart/:id
// @desc    Update cart item quantity
// @access  Private
router.put('/:id', auth, async (req, res) => {
    try {
        const { quantity } = req.body;

        requirePositive(quantity, 'Quantity');

        // Get current cart item with product info
        const [items] = await pool.query(`
            SELECT ci.*, p.stock_quantity 
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.id = ? AND ci.user_id = ?
        `, [req.params.id, req.user.id]);

        if (items.length === 0) {
            return notFound(res, 'Cart item not found');
        }

        // Check stock
        if (items[0].stock_quantity < quantity) {
            return badRequest(res, 'Insufficient stock');
        }

        await pool.query(
            'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
            [quantity, req.params.id, req.user.id]
        );

        success(res, null, 'Cart updated');
    } catch (error) {
        handleError(res, error, 'Update cart error');
    }
});

// @route   DELETE /api/cart/:id
// @desc    Remove item from cart
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return notFound(res, 'Cart item not found');
        }

        success(res, null, 'Removed from cart');
    } catch (error) {
        handleError(res, error, 'Remove from cart error');
    }
});

// @route   DELETE /api/cart
// @desc    Clear entire cart
// @access  Private
router.delete('/', auth, async (req, res) => {
    try {
        await pool.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
        success(res, null, 'Cart cleared');
    } catch (error) {
        handleError(res, error, 'Clear cart error');
    }
});

// @route   GET /api/cart/count
// @desc    Get cart item count
// @access  Private
router.get('/count', auth, async (req, res) => {
    try {
        const [result] = await pool.query(
            'SELECT COALESCE(SUM(quantity), 0) as count FROM cart_items WHERE user_id = ?',
            [req.user.id]
        );

        success(res, { count: result[0].count });
    } catch (error) {
        handleError(res, error, 'Get cart count error');
    }
});

module.exports = router;
