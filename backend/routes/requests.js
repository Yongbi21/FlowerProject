const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { auth } = require('../middleware/auth');

// Create request
router.post('/', auth, async (req, res) => {
    try {
        const { type, data, photo_url, notes } = req.body;
        
        // Validate required fields
        if (!type) {
            return res.status(400).json({ 
                success: false, 
                message: 'Request type is required' 
            });
        }
        
        if (!data) {
            return res.status(400).json({ 
                success: false, 
                message: 'Request data is required' 
            });
        }
        
        // Insert request
        const [result] = await pool.query(`
            INSERT INTO requests (user_id, type, status, data, photo_url, notes)
            VALUES (?, ?, 'pending', ?, ?, ?)
        `, [req.user.id, type, JSON.stringify(data), photo_url || null, notes || null]);
        
        const requestId = result.insertId;
        const [requests] = await pool.query('SELECT request_number FROM requests WHERE id = ?', [requestId]);
        
        // Create an order for ALL request types (booking, special_order, customized, inquiry)
        let orderId = null;
        try {
            // Parse request data
            const requestData = typeof data === 'string' ? JSON.parse(data) : data;
            
            // Create order for the request
            // Set default values for required fields
            const subtotal = 0; // Will be set by admin when providing quote
            const delivery_fee = 0;
            const total = 0;
            
            // Generate appropriate notes based on request type
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
                    user_id, 
                    request_id,
                    status, 
                    payment_status, 
                    payment_method, 
                    delivery_method, 
                    subtotal, 
                    delivery_fee, 
                    total, 
                    notes
                )
                VALUES (?, ?, 'pending', 'to_pay', 'cash_on_delivery', 'delivery', ?, ?, ?, ?)
            `, [
                req.user.id,
                requestId,
                subtotal,
                delivery_fee,
                total,
                orderNotes
            ]);
            
            orderId = orderResult.insertId;
            
            // Get order number
            const [orders] = await pool.query('SELECT order_number FROM orders WHERE id = ?', [orderId]);
            
            console.log(`Created order ${orders[0]?.order_number} for ${type} request ${requests[0].request_number}`);
        } catch (orderError) {
            console.error(`Error creating order for ${type} request:`, orderError);
            // Don't fail the request creation if order creation fails
            // The admin can manually create the order later if needed
        }
        
        res.status(201).json({
            success: true,
            request: {
                id: requestId,
                request_number: requests[0].request_number
            },
            order_id: orderId || null,
            message: 'Request submitted successfully'
        });
    } catch (error) {
        console.error('Create request error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Get user requests
router.get('/', auth, async (req, res) => {
    try {
        const [requests] = await pool.query(`
            SELECT * FROM requests WHERE user_id = ? ORDER BY created_at DESC
        `, [req.user.id]);
        
        res.json({ success: true, requests });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;