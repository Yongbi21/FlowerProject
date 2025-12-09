/**
 * Common validation utilities
 * Reduces duplicate validation logic across route files
 */

/**
 * Check if required fields are present in request body
 * @param {Object} body - Request body
 * @param {Array<string>} fields - Array of required field names
 * @throws {Error} If any required field is missing
 */
const requireFields = (body, fields) => {
    const missing = [];

    for (const field of fields) {
        if (!body[field] && body[field] !== 0 && body[field] !== false) {
            missing.push(field);
        }
    }

    if (missing.length > 0) {
        const error = new Error(`Missing required fields: ${missing.join(', ')}`);
        error.status = 400;
        throw error;
    }
};

/**
 * Check if resource exists in query result
 * @param {Array} items - Query result array
 * @param {string} message - Custom error message
 * @returns {Object} First item if exists
 * @throws {Error} If resource not found
 */
const checkExists = (items, message = 'Resource not found') => {
    if (!items || items.length === 0) {
        const error = new Error(message);
        error.status = 404;
        throw error;
    }
    return items[0];
};

/**
 * Validate that a value is positive
 * @param {number} value - Value to validate
 * @param {string} fieldName - Name of the field for error message
 * @throws {Error} If value is not positive
 */
const requirePositive = (value, fieldName = 'Value') => {
    if (value < 1) {
        const error = new Error(`${fieldName} must be at least 1`);
        error.status = 400;
        throw error;
    }
};

module.exports = {
    requireFields,
    checkExists,
    requirePositive
};
