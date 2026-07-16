const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateAdmin } = require('../middleware/authMiddleware');

router.get('/', authenticateAdmin, orderController.getAllOrders);
router.post('/', orderController.createOrder);

module.exports = router;
