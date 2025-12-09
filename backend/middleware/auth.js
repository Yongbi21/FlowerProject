const jwt = require('jsonwebtoken');

// Helper function to verify and extract token
const verifyToken = (req) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        const error = new Error('No authentication token, access denied');
        error.status = 401;
        throw error;
    }

    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        const error = new Error('Token is not valid');
        error.status = 401;
        throw error;
    }
};

// Middleware to verify JWT token
const auth = async (req, res, next) => {
    try {
        req.user = verifyToken(req);
        next();
    } catch (error) {
        res.status(error.status || 401).json({
            success: false,
            message: error.message
        });
    }
};

// Middleware to verify admin/employee role
const adminAuth = async (req, res, next) => {
    try {
        req.user = verifyToken(req);

        // Check if user is admin or employee
        if (req.user.role !== 'admin' && req.user.role !== 'employee') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        next();
    } catch (error) {
        res.status(error.status || 401).json({
            success: false,
            message: error.message
        });
    }
};

// Middleware to verify admin role only
const adminOnly = async (req, res, next) => {
    try {
        req.user = verifyToken(req);

        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        next();
    } catch (error) {
        res.status(error.status || 401).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { auth, adminAuth, adminOnly };
