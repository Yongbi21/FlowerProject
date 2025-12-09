const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { auth } = require('../middleware/auth');
const { handleError, notFound } = require('../utils/errorHandler');
const { success, created } = require('../utils/response');

// Get user orders
router.get('/', auth, async (req, res) => {
    try {
        const { status } = req.query;
        let query = `
            SELECT o.*, 
                   r.type as request_type,
                   r.data as request_data,
                   r.photo_url as request_photo_url,
                   r.event_type,
                   r.event_date
            FROM orders o
            LEFT JOIN requests r ON o.request_id = r.id
            WHERE o.user_id = ?
        `;
        const params = [req.user.id];

        if (status) {
            query += ' AND o.status = ?';
            params.push(status);
        }

        query += ' ORDER BY o.created_at DESC';

        const [orders] = await pool.query(query, params);

        // Parse request data if it exists and fetch order items
        const ordersWithRequestData = await Promise.all(orders.map(async (order) => {
            if (order.request_data) {
                try {
                    order.request_data = typeof order.request_data === 'string'
                        ? JSON.parse(order.request_data)
                        : order.request_data;
                } catch (e) {
                    console.error('Error parsing request data:', e);
                }
            }

            // Fetch order items
            const [items] = await pool.query(
                'SELECT * FROM order_items WHERE order_id = ?',
                [order.id]
            );
            order.items = items;

            return order;
        }));

        success(res, { orders: ordersWithRequestData });
    } catch (error) {
        handleError(res, error, 'Get orders error');
    }
});

// Create order
router.post('/', auth, async (req, res) => {
    try {
        const { items, delivery_method, address_id, payment_method, notes, receipt_url } = req.body;

        // Calculate totals
        let subtotal = 0;
        for (const item of items) {
            const [products] = await pool.query('SELECT price FROM products WHERE id = ?', [item.product_id]);
            if (products.length > 0) {
                subtotal += products[0].price * item.quantity;
            }
        }

        const delivery_fee = delivery_method === 'delivery' ? 100 : 0;
        const total = subtotal + delivery_fee;

        // Create order
        const [result] = await pool.query(`
            INSERT INTO orders (user_id, status, payment_status, payment_method, delivery_method, address_id, subtotal, delivery_fee, total, notes, receipt_url)
            VALUES (?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            req.user.id,
            payment_method === 'cash_on_delivery' ? 'to_pay' : 'awaiting_confirmation',
            payment_method,
            delivery_method,
            address_id || null,
            subtotal,
            delivery_fee,
            total,
            notes || null,
            receipt_url || null
        ]);

        const orderId = result.insertId;

        // Insert order items
        for (const item of items) {
            const [products] = await pool.query('SELECT name, price FROM products WHERE id = ?', [item.product_id]);
            if (products.length > 0) {
                await pool.query(`
                    INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal)
                    VALUES (?, ?, ?, ?, ?, ?)
                `, [
                    orderId,
                    item.product_id,
                    products[0].name,
                    item.quantity,
                    products[0].price,
                    products[0].price * item.quantity
                ]);
            }
        }

        // Get order number
        const [orders] = await pool.query('SELECT order_number FROM orders WHERE id = ?', [orderId]);

        created(res, {
            order: {
                id: orderId,
                order_number: orders[0].order_number,
                total
            }
        });
    } catch (error) {
        handleError(res, error, 'Create order error');
    }
});

// Get order details
router.get('/:id', auth, async (req, res) => {
    try {
        const [orders] = await pool.query(`
            SELECT o.*, a.street, a.city, a.province
            FROM orders o
            LEFT JOIN addresses a ON o.address_id = a.id
            WHERE o.id = ? AND o.user_id = ?
        `, [req.params.id, req.user.id]);

        if (orders.length === 0) {
            return notFound(res, 'Order not found');
        }

        const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);

        success(res, { order: { ...orders[0], items } });
    } catch (error) {
        handleError(res, error, 'Get order details error');
    }
});

// Cancel order
router.put('/:id/cancel', auth, async (req, res) => {
    try {
        await pool.query(`
            UPDATE orders SET status = 'cancelled' WHERE id = ? AND user_id = ? AND status IN ('pending', 'processing')
        `, [req.params.id, req.user.id]);

        success(res, null, 'Order cancelled');
    } catch (error) {
        handleError(res, error, 'Cancel order error');
    }
});

module.exports = router;