/**
 * Centralized response formatting utilities
 * Ensures consistent API response format across all endpoints
 */

/**
 * Send successful response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Optional success message
 */
const success = (res, data = null, message = null) => {
    const response = { success: true };

    if (data !== null) {
        // If data is a simple value or has a specific key, use it directly
        if (typeof data === 'object' && !Array.isArray(data)) {
            Object.assign(response, data);
        } else {
            response.data = data;
        }
    }

    if (message) {
        response.message = message;
    }

    res.json(response);
};

/**
 * Send 201 created response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Optional success message
 */
const created = (res, data = null, message = 'Resource created successfully') => {
    const response = { success: true };

    if (data !== null) {
        if (typeof data === 'object' && !Array.isArray(data)) {
            Object.assign(response, data);
        } else {
            response.data = data;
        }
    }

    if (message) {
        response.message = message;
    }

    res.status(201).json(response);
};

module.exports = {
    success,
    created
};
