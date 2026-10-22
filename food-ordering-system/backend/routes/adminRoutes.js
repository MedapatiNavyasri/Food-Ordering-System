const express = require('express');
const adminController = require('../controllers/adminController');
const { requireLogin, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// every admin route needs a logged-in admin
router.use(requireLogin, requireAdmin);

// food management
router.get('/foods', adminController.getFoods);
router.post('/foods', adminController.addFood);
router.put('/foods/:id', adminController.updateFood);
router.delete('/foods/:id', adminController.deleteFood);
router.patch('/foods/:id/availability', adminController.setAvailability);

// order management
router.get('/orders', adminController.getOrders);
router.patch('/orders/:id/status', adminController.updateOrderStatus);

module.exports = router;
