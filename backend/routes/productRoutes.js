const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const recommendationController = require('../controllers/recommendationController');
const { authenticateAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.get('/', productController.getAllProducts);
router.get('/:id/recommendations', recommendationController.getRecommendations);
router.get('/:id', productController.getProductById);
router.post('/', authenticateAdmin, upload.single('image'), productController.createProduct);
router.put('/:id', authenticateAdmin, upload.single('image'), productController.updateProduct);
router.delete('/:id', authenticateAdmin, productController.deleteProduct);

module.exports = router;
