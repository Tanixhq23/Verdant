const express = require('express');
const router = express.Router();
const footprintController = require('../controllers/footprintController');

// New, generalized route to handle all categories (energy, food, shopping, transport)
router.post('/:category', footprintController.calculateFootprint);

module.exports = router;