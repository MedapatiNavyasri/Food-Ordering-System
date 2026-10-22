const express = require('express');
const foodController = require('../controllers/foodController');

const router = express.Router();

router.get('/', foodController.getFoods);
router.get('/:id', foodController.getFoodById);

module.exports = router;
