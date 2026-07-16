const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateAdmin } = require('../middleware/authMiddleware');

router.use(authenticateAdmin);
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserDetails);
router.patch('/:id/status', userController.updateUserStatus);

module.exports = router;
