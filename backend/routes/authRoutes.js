const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/admin-register', authController.adminRegister);
router.post('/register', authController.register);
router.post('/user-login', authController.userLogin);

module.exports = router;
