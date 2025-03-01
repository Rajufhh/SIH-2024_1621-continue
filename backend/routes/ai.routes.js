const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');

router.post('/query', aiController.query);

module.exports = router;
