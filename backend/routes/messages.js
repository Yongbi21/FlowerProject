const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { auth } = require('../middleware/auth');
const { handleError } = require('../utils/errorHandler');
const { success, created } = require('../utils/response');

// Get user messages
router.get('/', auth, async (req, res) => {
    try {
        const { order_id } = req.query;
        let query = 'SELECT * FROM messages WHERE sender_id = ? AND sender_type = "customer"';
        const params = [req.user.id];

        if (order_id) {
            query += ' AND order_id = ?';
            params.push(order_id);
        }

        query += ' ORDER BY created_at ASC';

        const [messages] = await pool.query(query, params);
        success(res, { messages });
    } catch (error) {
        handleError(res, error, 'Get messages error');
    }
});

// Send message
router.post('/', auth, async (req, res) => {
    try {
        const { order_id, content } = req.body;

        const [result] = await pool.query(`
            INSERT INTO messages (order_id, sender_id, sender_type, content)
            VALUES (?, ?, 'customer', ?)
        `, [order_id || null, req.user.id, content]);

        created(res, { message_id: result.insertId });
    } catch (error) {
        handleError(res, error, 'Send message error');
    }
});

module.exports = router;