const express = require('express');
const cartController = require('../controllers/cartController');
const { requireLogin } = require('../middleware/authMiddleware');

const router = express.Router();

// the saved cart belongs to a logged-in user
router.use(requireLogin);

router.get('/', cartController.getCart);
router.put('/', cartController.saveCart);

module.exports = router;