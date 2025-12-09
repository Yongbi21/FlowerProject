/**
 * Centralized error handling utilities
 * Eliminates duplicate error handler code across all route files
 */

/**
 * Handle server errors with logging
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 * @param {string} context - Context message for logging
 */
const handleError = (res, error, context = 'Server error') => {
    console.error(`${context}:`, error);
    res.status(500).json({
        success: false,
        message: 'Server error'
    });
};

/**
 * Return 404 not found error
 * @param {Object} res - Express response object
 * @param {string} message - Custom error message
 */
const notFound = (res, message = 'Resource not found') => {
    res.status(404).json({
        success: false,
        message
    });
};

/**
 * Return 400 bad request error
 * @param {Object} res - Express response object
 * @param {string} message - Custom error message
 */
const badRequest = (res, message) => {
    res.status(400).json({
        success: false,
        message
    });
};

/**
 * Return 403 forbidden error
 * @param {Object} res - Express response object
 * @param {string} message - Custom error message
 */
const forbidden = (res, message = 'Access denied') => {
    res.status(403).json({
        success: false,
        message
    });
};

/**
 * Return 401 unauthorized error
 * @param {Object} res - Express response object
 * @param {string} message - Custom error message
 */
const unauthorized = (res, message = 'Unauthorized') => {
    res.status(401).json({
        success: false,
        message
    });
};

module.exports = {
    handleError,
    notFound,
    badRequest,
    forbidden,
    unauthorized
};
