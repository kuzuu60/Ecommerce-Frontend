const { getProducts, saveProducts } = require('../utils/dataHandler');

exports.getAllProducts = (req, res) => {
    const data = getProducts();
    res.json(data);
};

exports.getProductById = (req, res) => {
    const data = getProducts();
    const product = data.products.find(p => p.id === parseInt(req.params.id));

    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
};

exports.createProduct = (req, res) => {
    try {
        const { title, price, description, category, image, stock } = req.body;

        if (!title || !price || !category) {
            return res.status(400).json({ message: 'Title, price, and category are required' });
        }

        const data = getProducts();

        let imageUrl = image;
        if (req.file) {
            imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        } else if (!imageUrl) {
            imageUrl = 'https://via.placeholder.com/150';
        }

        const maxId = data.products.reduce((max, p) => (p.id > max ? p.id : max), 0);
        const newProduct = {
            id: maxId + 1,
            title,
            price: parseFloat(price),
            description: description || '',
            category,
            thumbnail: imageUrl,
            images: [imageUrl],
            rating: 4.5,
            stock: stock ? parseInt(stock) : 100,
            brand: 'Generic',
            availabilityStatus: 'In Stock',
            discountPercentage: 0
        };

        data.products.push(newProduct);
        saveProducts(data);

        res.status(201).json(newProduct);
    } catch (err) {
        console.error("Error adding product:", err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.updateProduct = (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { title, price, description, category, image, stock } = req.body;
        const data = getProducts();

        const productIndex = data.products.findIndex(p => p.id === id);
        if (productIndex === -1) {
            return res.status(404).json({ message: 'Product not found' });
        }

        let imageUrl = data.products[productIndex].thumbnail;
        if (req.file) {
            imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        } else if (image) {
            imageUrl = image;
        }

        const updatedProduct = {
            ...data.products[productIndex],
            title: title || data.products[productIndex].title,
            price: price ? parseFloat(price) : data.products[productIndex].price,
            description: description || data.products[productIndex].description,
            category: category || data.products[productIndex].category,
            stock: stock ? parseInt(stock) : data.products[productIndex].stock,
            thumbnail: imageUrl,
            images: [imageUrl]
        };

        data.products[productIndex] = updatedProduct;
        saveProducts(data);

        res.json(updatedProduct);
    } catch (err) {
        console.error("Error updating product:", err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.deleteProduct = (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const data = getProducts();

        const initialLength = data.products.length;
        const filteredProducts = data.products.filter(p => p.id !== id);

        if (filteredProducts.length === initialLength) {
            return res.status(404).json({ message: 'Product not found' });
        }

        data.products = filteredProducts;
        saveProducts(data);

        res.json({ message: 'Product deleted successfully', id });
    } catch (err) {
        console.error("Error deleting product:", err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
