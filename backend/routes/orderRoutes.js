const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateAdmin, authenticateUser } = require('../middleware/authMiddleware');

router.get('/', authenticateAdmin, orderController.getAllOrders);
router.get('/my', authenticateUser, orderController.getUserOrders);
router.post('/', authenticateUser, orderController.createOrder);
router.put('/:id/status', authenticateAdmin, orderController.updateOrderStatus);

module.exports = router;
