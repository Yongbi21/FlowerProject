const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { auth } = require('../middleware/auth');
const { badRequest, handleError } = require('../utils/errorHandler');
const { success } = require('../utils/response');

// Upload image
router.post('/image', auth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return badRequest(res, 'No file uploaded');
        }

        const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        success(res, { url, filename: req.file.filename });
    } catch (error) {
        handleError(res, error, 'Upload failed');
    }
});

module.exports = router;