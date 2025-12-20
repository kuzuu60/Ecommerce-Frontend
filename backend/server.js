const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Load Product Data
const productsFilePath = path.join(__dirname, 'data', 'products.json');

const getProducts = () => {
    try {
        const data = fs.readFileSync(productsFilePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading products file:", err);
        return { products: [] };
    }
};

// Routes

// GET All Products
app.get('/api/products', (req, res) => {
    const data = getProducts();
    const limit = parseInt(req.query.limit) || 200;
    // Mocking the limit if needed, or just returning all for now as per frontend requirement
    res.json(data);
});

// GET Single Product
app.get('/api/products/:id', (req, res) => {
    const data = getProducts();
    const product = data.products.find(p => p.id === parseInt(req.params.id));

    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
});


// POST Add New Product
app.post('/api/products', (req, res) => {
    try {
        const { title, price, description, category, image } = req.body;

        if (!title || !price || !category) {
            return res.status(400).json({ message: 'Title, price, and category are required' });
        }

        const data = getProducts();

        // Generate new ID (max existing ID + 1)
        const maxId = data.products.reduce((max, p) => (p.id > max ? p.id : max), 0);
        const newProduct = {
            id: maxId + 1,
            title,
            price: parseFloat(price),
            description: description || '',
            category,
            image: image || 'https://via.placeholder.com/150',
            rating: { rate: 0, count: 0 }
        };

        data.products.push(newProduct);
        fs.writeFileSync(productsFilePath, JSON.stringify(data, null, 2));

        res.status(201).json(newProduct);
    } catch (err) {
        console.error("Error adding product:", err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// DELETE Product
app.delete('/api/products/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const data = getProducts();

        const initialLength = data.products.length;
        const filteredProducts = data.products.filter(p => p.id !== id);

        if (filteredProducts.length === initialLength) {
            return res.status(404).json({ message: 'Product not found' });
        }

        data.products = filteredProducts;
        fs.writeFileSync(productsFilePath, JSON.stringify(data, null, 2));

        res.json({ message: 'Product deleted successfully', id });
    } catch (err) {
        console.error("Error deleting product:", err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// eSewa Signature Generation (Optional Security Enhancement)
app.post('/api/payment/esewa-signature', (req, res) => {
    const { amount, productId } = req.body;

    if (!amount || !productId) {
        return res.status(400).json({ message: 'Missing required parameters' });
    }

    const secret_key = "8gBm/:&EnhH.1/q"; // In prod, use process.env.ESEWA_SECRET_KEY
    const product_code = "EPAYTEST";
    const transaction_uuid = productId + "_" + Date.now();

    const signatureString = `total_amount=${amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    const hash = crypto.HmacSHA256(signatureString, secret_key);
    const signature = crypto.enc.Base64.stringify(hash);

    res.json({
        signature,
        transaction_uuid,
        product_code,
        signed_field_names: "total_amount,transaction_uuid,product_code"
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
