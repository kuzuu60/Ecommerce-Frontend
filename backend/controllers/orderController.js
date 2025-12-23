const { getProducts, saveProducts } = require('../utils/dataHandler');

exports.createOrder = (req, res) => {
    try {
        const { items } = req.body;
        console.log("Received Order:", items);

        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ message: 'Invalid order items' });
        }

        const data = getProducts();

        for (const item of items) {
            const product = data.products.find(p => p.id == item.id);
            if (!product) {
                return res.status(404).json({ message: `Product ${item.id} not found` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${product.title}` });
            }
        }

        for (const item of items) {
            const product = data.products.find(p => p.id == item.id);
            product.stock -= item.quantity;

            if (product.stock <= 0) {
                product.availabilityStatus = 'Out of Stock';
            } else if (product.stock < 10) {
                product.availabilityStatus = 'Low Stock';
            } else {
                product.availabilityStatus = 'In Stock';
            }
        }

        saveProducts(data);
        res.json({ message: 'Order placed successfully' });
    } catch (err) {
        console.error("Error placing order:", err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
