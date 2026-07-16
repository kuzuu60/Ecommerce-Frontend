const pool = require('../models/db');
const { buildProductSpecs } = require('../utils/productFeatures');

exports.getAllProducts = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products ORDER BY id DESC');
        const products = result.rows.map(p => ({
            id: p.id,
            title: p.title,
            description: p.description,
            specs: p.specs || '',
            category: p.category,
            price: Number(p.price),
            discountPercentage: Number(p.discount_percentage),
            rating: Number(p.rating),
            stock: p.stock,
            brand: p.brand,
            sku: p.sku,
            weight: Number(p.weight),
            warrantyInformation: p.warranty_information,
            shippingInformation: p.shipping_information,
            availabilityStatus: p.availability_status,
            thumbnail: p.thumbnail,
            images: p.images,
            reviews: p.reviews,
            dimensions: p.dimensions
        }));
        res.json({ products });
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const p = result.rows[0];
        const product = {
            id: p.id,
            title: p.title,
            description: p.description,
            specs: p.specs || '',
            category: p.category,
            price: Number(p.price),
            discountPercentage: Number(p.discount_percentage),
            rating: Number(p.rating),
            stock: p.stock,
            brand: p.brand,
            sku: p.sku,
            weight: Number(p.weight),
            warrantyInformation: p.warranty_information,
            shippingInformation: p.shipping_information,
            availabilityStatus: p.availability_status,
            thumbnail: p.thumbnail,
            images: p.images,
            reviews: p.reviews,
            dimensions: p.dimensions
        };
        res.json(product);
    } catch (err) {
        console.error("Error fetching product by ID:", err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const { title, price, description, specs, category, image, stock, discountPercentage, warrantyInformation } = req.body;

        if (!title || !price || !category) {
            return res.status(400).json({ message: 'Title, price, and category are required' });
        }

        let imageUrl = image;
        if (req.file) {
            imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        } else if (!imageUrl) {
            imageUrl = 'https://via.placeholder.com/150';
        }

        const queryText = `
            INSERT INTO products (
                title, price, description, specs, category, thumbnail, images,
                rating, stock, brand, sku, weight, warranty_information,
                shipping_information, availability_status, discount_percentage,
                reviews, dimensions
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            RETURNING *;
        `;

        const productSpecs = specs?.trim() || buildProductSpecs({ title, description, category });
        const values = [
            title,
            parseFloat(price),
            description || '',
            productSpecs,
            category,
            imageUrl,
            JSON.stringify([imageUrl]),
            4.5,
            stock ? parseInt(stock, 10) : 100,
            'Generic',
            '',
            0,
            warrantyInformation?.trim() || 'No warranty',
            'Ships in 1 month',
            'In Stock',
            discountPercentage ? parseFloat(discountPercentage) : 0,
            JSON.stringify([]),
            JSON.stringify({})
        ];

        const result = await pool.query(queryText, values);
        const p = result.rows[0];
        const newProduct = {
            id: p.id,
            title: p.title,
            price: Number(p.price),
            description: p.description,
            specs: p.specs || '',
            category: p.category,
            thumbnail: p.thumbnail,
            images: p.images,
            rating: Number(p.rating),
            stock: p.stock,
            brand: p.brand,
            sku: p.sku,
            weight: Number(p.weight),
            warrantyInformation: p.warranty_information,
            shippingInformation: p.shipping_information,
            availabilityStatus: p.availability_status,
            discountPercentage: Number(p.discount_percentage),
            reviews: p.reviews,
            dimensions: p.dimensions
        };

        res.status(201).json(newProduct);
    } catch (err) {
        console.error("Error adding product:", err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { title, price, description, specs, category, image, stock, discountPercentage, warrantyInformation } = req.body;

        const existing = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        if (existing.rowCount === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const currentProduct = existing.rows[0];

        let imageUrl = currentProduct.thumbnail;
        if (req.file) {
            imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        } else if (image) {
            imageUrl = image;
        }

        const newStock = stock !== undefined ? parseInt(stock, 10) : currentProduct.stock;
        let availabilityStatus = 'In Stock';
        if (newStock <= 0) {
            availabilityStatus = 'Out of Stock';
        } else if (newStock < 10) {
            availabilityStatus = 'Low Stock';
        }

        const queryText = `
            UPDATE products SET
                title = $1,
                price = $2,
                description = $3,
                specs = $4,
                category = $5,
                thumbnail = $6,
                images = $7,
                stock = $8,
                discount_percentage = $9,
                warranty_information = $10,
                availability_status = $11
            WHERE id = $12
            RETURNING *;
        `;

        const nextTitle = title || currentProduct.title;
        const nextDescription = description !== undefined ? description : currentProduct.description;
        const nextCategory = category || currentProduct.category;
        const nextSpecs = specs !== undefined
            ? specs
            : currentProduct.specs || buildProductSpecs({ title: nextTitle, description: nextDescription, category: nextCategory });
        const nextWarranty = warrantyInformation !== undefined
            ? String(warrantyInformation || '').trim()
            : currentProduct.warranty_information || 'No warranty';

        const values = [
            nextTitle,
            price !== undefined ? parseFloat(price) : currentProduct.price,
            nextDescription,
            nextSpecs,
            nextCategory,
            imageUrl,
            JSON.stringify([imageUrl]),
            newStock,
            discountPercentage !== undefined ? parseFloat(discountPercentage) : currentProduct.discount_percentage,
            nextWarranty,
            availabilityStatus,
            id
        ];

        const result = await pool.query(queryText, values);
        const p = result.rows[0];

        const updatedProduct = {
            id: p.id,
            title: p.title,
            price: Number(p.price),
            description: p.description,
            specs: p.specs || '',
            category: p.category,
            thumbnail: p.thumbnail,
            images: p.images,
            rating: Number(p.rating),
            stock: p.stock,
            brand: p.brand,
            sku: p.sku,
            weight: Number(p.weight),
            warrantyInformation: p.warranty_information,
            shippingInformation: p.shipping_information,
            availabilityStatus: p.availability_status,
            discountPercentage: Number(p.discount_percentage),
            reviews: p.reviews,
            dimensions: p.dimensions
        };

        res.json(updatedProduct);
    } catch (err) {
        console.error("Error updating product:", err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const result = await pool.query('DELETE FROM products WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully', id });
    } catch (err) {
        console.error("Error deleting product:", err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
