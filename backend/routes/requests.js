const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { auth } = require('../middleware/auth');
const { handleError, badRequest } = require('../utils/errorHandler');
const { success, created } = require('../utils/response');

// Create request
router.post('/', auth, async (req, res) => {
    try {
        const { type, data, photo_url, notes } = req.body;

        // Validate required fields
        if (!type) return badRequest(res, 'Request type is required');
        if (!data) return badRequest(res, 'Request data is required');

        // Insert request
        const [result] = await pool.query(`
            INSERT INTO requests (user_id, type, status, data, photo_url, notes)
            VALUES (?, ?, 'pending', ?, ?, ?)
        `, [req.user.id, type, JSON.stringify(data), photo_url || null, notes || null]);

        const requestId = result.insertId;
        const [requests] = await pool.query('SELECT request_number FROM requests WHERE id = ?', [requestId]);

        // Create an order for ALL request types
        let orderId = null;
        try {
            const requestData = typeof data === 'string' ? JSON.parse(data) : data;
            const subtotal = 0, delivery_fee = 0, total = 0;

            let orderNotes = notes || '';
            if (!orderNotes) {
                if (type === 'booking') {
                    orderNotes = `Event Booking: ${requestData.eventType || 'Event'} on ${requestData.eventDate || 'TBD'}`;
                } else if (type === 'special_order') {
                    orderNotes = `Special Order for ${requestData.recipientName || 'recipient'}`;
                } else if (type === 'customized') {
                    orderNotes = `Customized Bouquet Request`;
                } else if (type === 'inquiry') {
                    orderNotes = `Inquiry: ${requestData.subject || requestData.message || 'General Inquiry'}`;
                }
            }

            const [orderResult] = await pool.query(`
                INSERT INTO orders (
                    user_id, request_id, status, payment_status, payment_method, 
                    delivery_method, subtotal, delivery_fee, total, notes
                )
                VALUES (?, ?, 'pending', 'to_pay', 'cash_on_delivery', 'delivery', ?, ?, ?, ?)
            `, [req.user.id, requestId, subtotal, delivery_fee, total, orderNotes]);

            orderId = orderResult.insertId;
            const [orders] = await pool.query('SELECT order_number FROM orders WHERE id = ?', [orderId]);
            console.log(`Created order ${orders[0]?.order_number} for ${type} request ${requests[0].request_number}`);
        } catch (orderError) {
            console.error(`Error creating order for ${type} request:`, orderError);
        }

        created(res, {
            request: { id: requestId, request_number: requests[0].request_number },
            order_id: orderId || null
        }, 'Request submitted successfully');
    } catch (error) {
        handleError(res, error, 'Create request error');
    }
});

// Get user requests
router.get('/', auth, async (req, res) => {
    try {
        const [requests] = await pool.query(`
            SELECT * FROM requests WHERE user_id = ? ORDER BY created_at DESC
        `, [req.user.id]);

        success(res, { requests });
    } catch (error) {
        handleError(res, error, 'Get requests error');
    }
});

module.exports = router;