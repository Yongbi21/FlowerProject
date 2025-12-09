const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { auth } = require('../middleware/auth');
const { handleError, notFound, badRequest, forbidden, unauthorized } = require('../utils/errorHandler');
const { success, created } = require('../utils/response');

// =====================================================
// CUSTOMER AUTHENTICATION
// =====================================================

// @route   POST /api/auth/register
// @desc    Register new customer
// @access  Public
router.post('/register', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().notEmpty(),
    body('phone').optional().trim()
], async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return badRequest(res, errors.array()[0].msg);
        }

        const { email, password, name, phone } = req.body;

        // Check if user exists
        const [existing] = await pool.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            return badRequest(res, 'Email already registered');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const [result] = await pool.query(
            'INSERT INTO users (email, password, name, phone, role) VALUES (?, ?, ?, ?, ?)',
            [email, hashedPassword, name, phone || null, 'customer']
        );

        // Generate JWT
        const token = jwt.sign(
            { id: result.insertId, email, role: 'customer' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            user: {
                id: result.insertId,
                email,
                name,
                role: 'customer'
            },
            token
        });
    } catch (error) {
        handleError(res, error, 'Registration error');
    }
});

// @route   POST /api/auth/login
// @desc    Login customer
// @access  Public
router.post('/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return badRequest(res, errors.array()[0].msg);
        }

        const { email, password } = req.body;

        // Find user
        const [users] = await pool.query(
            'SELECT id, email, password, name, role, is_active FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return unauthorized(res, 'Invalid credentials');
        }

        const user = users[0];

        // Check if account is active
        if (!user.is_active) {
            return forbidden(res, 'Account is deactivated');
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return unauthorized(res, 'Invalid credentials');
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            token
        });
    } catch (error) {
        handleError(res, error, 'Login error');
    }
});

// =====================================================
// ADMIN AUTHENTICATION
// =====================================================

// @route   POST /api/auth/admin/login
// @desc    Login admin/employee
// @access  Public
router.post('/admin/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return badRequest(res, errors.array()[0].msg);
        }

        const { email, password } = req.body;

        // Find admin
        const [admins] = await pool.query(
            'SELECT id, email, password, name, role, is_active FROM admins WHERE email = ?',
            [email]
        );

        if (admins.length === 0) {
            return unauthorized(res, 'Invalid credentials');
        }

        const admin = admins[0];

        // Check if account is active
        if (!admin.is_active) {
            return forbidden(res, 'Account is deactivated');
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return unauthorized(res, 'Invalid credentials');
        }

        // Generate JWT
        const token = jwt.sign(
            { id: admin.id, email: admin.email, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.json({
            success: true,
            user: {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                role: admin.role
            },
            token
        });
    } catch (error) {
        handleError(res, error, 'Admin login error');
    }
});

// =====================================================
// PASSWORD MANAGEMENT
// =====================================================

// @route   POST /api/auth/change-password
// @desc    Change password
// @access  Private
router.post('/change-password', auth, [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return badRequest(res, errors.array()[0].msg);
        }

        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        // Get current password
        const [users] = await pool.query(
            'SELECT password FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return notFound(res, 'User not found');
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, users[0].password);
        if (!isMatch) {
            return unauthorized(res, 'Current password is incorrect');
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await pool.query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, userId]
        );

        success(res, null, 'Password changed successfully');
    } catch (error) {
        handleError(res, error, 'Change password error');
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT id, email, name, phone, date_of_birth, role, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return notFound(res, 'User not found');
        }

        success(res, { user: users[0] });
    } catch (error) {
        handleError(res, error, 'Get user error');
    }
});

module.exports = router;
