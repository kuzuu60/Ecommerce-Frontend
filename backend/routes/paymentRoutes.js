const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/esewa-signature', paymentController.generateEsewaSignature);

module.exports = router;
