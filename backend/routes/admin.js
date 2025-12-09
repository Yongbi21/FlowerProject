const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { adminAuth, adminOnly } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const { handleError, notFound, badRequest } = require('../utils/errorHandler');
const { success, created } = require('../utils/response');

// Get all orders (Admin/Employee)
router.get('/orders', adminAuth, async (req, res) => {
    try {
        const { status, payment_status } = req.query;
        let query = 'SELECT o.*, u.name as customer_name, u.email as customer_email FROM orders o JOIN users u ON o.user_id = u.id WHERE 1=1';
        const params = [];

        if (status) {
            query += ' AND o.status = ?';
            params.push(status);
        }
        if (payment_status) {
            query += ' AND o.payment_status = ?';
            params.push(payment_status);
        }

        query += ' ORDER BY o.created_at DESC';

        const [orders] = await pool.query(query, params);
        success(res, { orders });
    } catch (error) {
        handleError(res, error, 'Get orders error');
    }
});

// Accept order (move from pending to accepted, then can move to processing)
router.post('/orders/:id/accept', adminAuth, async (req, res) => {
    try {
        // Check if order exists and is pending
        const [orders] = await pool.query('SELECT status FROM orders WHERE id = ?', [req.params.id]);

        if (orders.length === 0) {
            return notFound(res, 'Order not found');
        }

        if (orders[0].status !== 'pending') {
            return badRequest(res, 'Only pending orders can be accepted');
        }

        // Update order to accepted status and set accepted_at timestamp
        await pool.query(
            'UPDATE orders SET status = ?, accepted_at = NOW() WHERE id = ?',
            ['accepted', req.params.id]
        );

        success(res, null, 'Order accepted');
    } catch (error) {
        handleError(res, error, 'Accept order error');
    }
});

// Decline order
router.post('/orders/:id/decline', adminAuth, async (req, res) => {
    try {
        const { reason } = req.body;

        // Check if order exists and is pending
        const [orders] = await pool.query('SELECT status FROM orders WHERE id = ?', [req.params.id]);

        if (orders.length === 0) {
            return notFound(res, 'Order not found');
        }

        if (orders[0].status !== 'pending') {
            return badRequest(res, 'Only pending orders can be declined');
        }

        // Update order to declined status
        await pool.query(
            'UPDATE orders SET status = ?, decline_reason = ? WHERE id = ?',
            ['declined', reason || null, req.params.id]
        );

        success(res, null, 'Order declined');
    } catch (error) {
        handleError(res, error, 'Decline order error');
    }
});

// Update order status
router.put('/orders/:id/status', adminAuth, async (req, res) => {
    try {
        const { status } = req.body;

        // Check current order status
        const [orders] = await pool.query('SELECT status, accepted_at FROM orders WHERE id = ?', [req.params.id]);

        if (orders.length === 0) {
            return notFound(res, 'Order not found');
        }

        const currentOrder = orders[0];

        // Prevent moving to 'processing' unless order is 'accepted'
        if (status === 'processing') {
            if (currentOrder.status !== 'accepted') {
                return badRequest(res, 'Order must be accepted before it can be moved to processing. Please accept the order first.');
            }
        }

        // Allow other status transitions
        await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
        success(res, null, 'Status updated');
    } catch (error) {
        handleError(res, error, 'Update order status error');
    }
});

// Update payment status
router.put('/orders/:id/payment-status', adminAuth, async (req, res) => {
    try {
        const { payment_status } = req.body;
        await pool.query('UPDATE orders SET payment_status = ? WHERE id = ?', [payment_status, req.params.id]);
        success(res, null, 'Payment status updated');
    } catch (error) {
        handleError(res, error, 'Update payment status error');
    }
});

// Get sales summary (Admin only)
router.get('/sales/summary', adminOnly, async (req, res) => {
    try {
        const [summary] = await pool.query('SELECT * FROM order_statistics');
        success(res, { summary: summary[0] });
    } catch (error) {
        handleError(res, error, 'Get sales summary error');
    }
});

// =====================================================
// STOCK MANAGEMENT
// =====================================================

// Get all stock items
router.get('/stock', adminAuth, async (req, res) => {
    try {
        const { category } = req.query;
        let query = 'SELECT * FROM stock WHERE 1=1';
        const params = [];

        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }

        query += ' ORDER BY category, name';

        const [stock] = await pool.query(query, params);
        success(res, { stock });
    } catch (error) {
        handleError(res, error, 'Get stock error');
    }
});

// Create stock item
router.post('/stock', adminAuth, async (req, res) => {
    try {
        const { name, category, quantity, price, unit, reorder_level, is_available } = req.body;

        if (!name || !category) {
            return badRequest(res, 'Name and category are required');
        }

        const [result] = await pool.query(
            'INSERT INTO stock (name, category, quantity, price, unit, reorder_level, is_available) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, category, quantity || 0, price || 0, unit || 'pieces', reorder_level || 10, is_available !== false]
        );

        res.status(201).json({
            success: true,
            message: 'Stock item created',
            stock: { id: result.insertId, name, category, quantity, price, unit, reorder_level, is_available }
        });
    } catch (error) {
        handleError(res, error, 'Create stock error');
    }
});

// Update stock item
router.put('/stock/:id', adminAuth, async (req, res) => {
    try {
        const { name, category, quantity, price, unit, reorder_level, is_available } = req.body;

        const [result] = await pool.query(
            'UPDATE stock SET name = ?, category = ?, quantity = ?, price = ?, unit = ?, reorder_level = ?, is_available = ? WHERE id = ?',
            [name, category, quantity, price, unit, reorder_level, is_available, req.params.id]
        );

        if (result.affectedRows === 0) {
            return notFound(res, 'Stock item not found');
        }

        success(res, null, 'Stock item updated');
    } catch (error) {
        handleError(res, error, 'Update stock error');
    }
});

// Delete stock item
router.delete('/stock/:id', adminAuth, async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM stock WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return notFound(res, 'Stock item not found');
        }

        success(res, null, 'Stock item deleted');
    } catch (error) {
        handleError(res, error, 'Delete stock error');
    }
});

// =====================================================
// MESSAGES
// =====================================================

// Get all messages (grouped by user)
router.get('/messages', adminAuth, async (req, res) => {
    try {
        // Get the latest message for each user to form the conversation list
        const query = `
            SELECT 
                m.*,
                u.name as sender_name,
                u.email as sender_email,
                (SELECT COUNT(*) FROM messages WHERE sender_id = m.sender_id AND is_read = FALSE AND sender_type = 'customer') as unread_count
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.id IN (
                SELECT MAX(id)
                FROM messages
                GROUP BY sender_id
            )
            ORDER BY m.created_at DESC
        `;

        const [conversations] = await pool.query(query);
        success(res, { conversations });
    } catch (error) {
        handleError(res, error, 'Get messages error');
    }
});

// Send message (Admin reply)
router.post('/messages', adminAuth, async (req, res) => {
    try {
        const { user_id, content, order_id } = req.body;

        if (!user_id || !content) {
            return badRequest(res, 'User ID and content are required');
        }

        const [result] = await pool.query(
            'INSERT INTO messages (sender_id, sender_type, content, order_id, is_read) VALUES (?, ?, ?, ?, ?)',
            [user_id, 'admin', content, order_id || null, false]
        );

        res.status(201).json({
            success: true,
            message: 'Message sent',
            message_id: result.insertId
        });
    } catch (error) {
        handleError(res, error, 'Send message error');
    }
});

// =====================================================
// NOTIFICATIONS
// =====================================================

// Get all notifications
router.get('/notifications', adminAuth, async (req, res) => {
    try {
        const [notifications] = await pool.query(`
            SELECT n.*, u.name as user_name 
            FROM notifications n 
            LEFT JOIN users u ON n.user_id = u.id 
            ORDER BY n.created_at DESC 
            LIMIT 50
        `);
        success(res, { notifications });
    } catch (error) {
        handleError(res, error, 'Get notifications error');
    }
});

// Send notification
router.post('/notifications', adminAuth, async (req, res) => {
    try {
        const { user_id, title, message, type } = req.body;

        if (!title || !message) {
            return badRequest(res, 'Title and message are required');
        }

        // If user_id is provided, send to specific user. If not, maybe broadcast? 
        // For now, let's require user_id or handle broadcast logic later.
        // Let's assume user_id is optional and if null, it's a system-wide notification (logic to be added if needed)
        // But the schema links to user_id. Let's stick to specific user for now or allow NULL for system.

        const [result] = await pool.query(
            'INSERT INTO notifications (user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, ?)',
            [user_id || null, title, message, type || 'system', false]
        );

        res.status(201).json({
            success: true,
            message: 'Notification sent',
            notification: { id: result.insertId, user_id, title, message, type, created_at: new Date() }
        });
    } catch (error) {
        handleError(res, error, 'Send notification error');
    }
});

// Delete notification
router.delete('/notifications/:id', adminAuth, async (req, res) => {
    try {
        await pool.query('DELETE FROM notifications WHERE id = ?', [req.params.id]);
        success(res, null, 'Notification deleted');
    } catch (error) {
        handleError(res, error, 'Delete notification error');
    }
});

// =====================================================
// CONTENT MANAGEMENT
// =====================================================

// Get About Content
router.get('/content/about', async (req, res) => {
    try {
        const [content] = await pool.query('SELECT * FROM about_content WHERE id = 1');
        success(res, { content: content[0] });
    } catch (error) {
        handleError(res, error, 'Get about error');
    }
});

// Update About Content
router.put('/content/about', adminAuth, async (req, res) => {
    try {
        const { description, mission, vision } = req.body;
        await pool.query(
            'UPDATE about_content SET description = ?, mission = ?, vision = ? WHERE id = 1',
            [description, mission, vision]
        );
        success(res, null, 'About content updated');
    } catch (error) {
        handleError(res, error, 'Update about error');
    }
});

// Get Contact Info
router.get('/content/contact', async (req, res) => {
    try {
        const [info] = await pool.query('SELECT * FROM contact_info WHERE id = 1');
        success(res, { info: info[0] });
    } catch (error) {
        handleError(res, error, 'Get contact error');
    }
});

// Update Contact Info
router.put('/content/contact', adminAuth, async (req, res) => {
    try {
        const { address, phone, email, map_url } = req.body;
        await pool.query(
            'UPDATE contact_info SET address = ?, phone = ?, email = ?, map_url = ? WHERE id = 1',
            [address, phone, email, map_url]
        );
        success(res, null, 'Contact info updated');
    } catch (error) {
        handleError(res, error, 'Update contact error');
    }
});

// =====================================================
// EMPLOYEE MANAGEMENT
// =====================================================

// Get Employees
router.get('/employees', adminAuth, async (req, res) => {
    try {
        // Fetch from admins table where role is employee
        const [employees] = await pool.query('SELECT id, name, email, role, created_at FROM admins WHERE role = "employee"');
        success(res, { employees });
    } catch (error) {
        handleError(res, error, 'Get employees error');
    }
});

// Add Employee
router.post('/employees', adminAuth, async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return badRequest(res, 'All fields are required');
        }

        // Check if email exists
        const [existing] = await pool.query('SELECT id FROM admins WHERE email = ?', [email]);
        if (existing.length > 0) {
            return badRequest(res, 'Email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            'INSERT INTO admins (name, email, password, role) VALUES (?, ?, ?, "employee")',
            [name, email, hashedPassword]
        );

        res.status(201).json({ success: true, message: 'Employee added successfully' });
    } catch (error) {
        handleError(res, error, 'Add employee error');
    }
});

// Delete Employee
router.delete('/employees/:id', adminAuth, async (req, res) => {
    try {
        await pool.query('DELETE FROM admins WHERE id = ? AND role = "employee"', [req.params.id]);
        success(res, null, 'Employee deleted');
    } catch (error) {
        handleError(res, error, 'Delete employee error');
    }
});

// =====================================================
// REQUESTS MANAGEMENT
// =====================================================

// Get all requests
router.get('/requests', adminAuth, async (req, res) => {
    try {
        const [requests] = await pool.query(`
            SELECT r.*, u.name as user_name, u.email as user_email 
            FROM requests r 
            LEFT JOIN users u ON r.user_id = u.id 
            ORDER BY r.created_at DESC
        `);
        success(res, { requests });
    } catch (error) {
        handleError(res, error, 'Get requests error');
    }
});

// Update request status
router.put('/requests/:id/status', adminAuth, async (req, res) => {
    try {
        const { status } = req.body;

        // If status is 'declined' or 'cancelled', delete the request instead of updating
        if (status === 'declined' || status === 'cancelled') {
            const [result] = await pool.query('DELETE FROM requests WHERE id = ?', [req.params.id]);

            if (result.affectedRows === 0) {
                return notFound(res, 'Request not found');
            }

            return success(res, null, 'Request deleted');
        }

        // For other statuses, update normally
        await pool.query('UPDATE requests SET status = ? WHERE id = ?', [status, req.params.id]);
        success(res, null, 'Status updated');
    } catch (error) {
        handleError(res, error, 'Update request status error');
    }
});

module.exports = router;