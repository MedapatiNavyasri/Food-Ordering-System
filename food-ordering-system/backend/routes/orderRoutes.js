const express = require('express');
const orderController = require('../controllers/orderController');
const { requireLogin } = require('../middleware/authMiddleware');

const router = express.Router();

// every order route needs a logged-in user
router.use(requireLogin);

router.post('/', orderController.placeOrder);
router.get('/my', orderController.getMyOrders); // must come before '/:id'
router.get('/:id', orderController.getOrderById);

module.exports = router;
