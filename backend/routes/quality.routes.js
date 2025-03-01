// backend/routes/quality.routes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');

// Protect all quality routes with authentication
router.use(authMiddleware.verifyToken);

module.exports = router;
