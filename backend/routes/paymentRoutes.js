const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/esewa-signature', paymentController.generateEsewaSignature);
router.post('/esewa-verify', paymentController.verifyEsewaResponse);

module.exports = router;
