const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { auth } = require('../middleware/auth');
const { handleError } = require('../utils/errorHandler');
const { success } = require('../utils/response');

// Get user notifications
router.get('/', auth, async (req, res) => {
    try {
        const [notifications] = await pool.query(`
            SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50
        `, [req.user.id]);

        success(res, { notifications });
    } catch (error) {
        handleError(res, error, 'Get notifications error');
    }
});

// Mark as read
router.put('/:id/read', auth, async (req, res) => {
    try {
        await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        success(res, null, 'Marked as read');
    } catch (error) {
        handleError(res, error, 'Mark notification error');
    }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
    try {
        await pool.query('DELETE FROM notifications WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        success(res, null, 'Notification deleted');
    } catch (error) {
        handleError(res, error, 'Delete notification error');
    }
});

module.exports = router;