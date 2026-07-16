const express = require('express');
const router = express.Router();
const qaController = require('../controllers/qaController');

router.post('/', qaController.answerQuestion);
router.post('/recommend', qaController.recommendProducts);

module.exports = router;
