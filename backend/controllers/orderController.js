const { getProducts, saveProducts, getOrders, saveOrders } = require('../utils/dataHandler');
const { createOrder: createOrderDB } = require('../models/orders');

exports.createOrder = async (req, res) => {
    try {
        const { items, customerInfo, status } = req.body;
        console.log("Received Order:", items, "Customer:", customerInfo, "Status:", status);

        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ message: 'Invalid order items' });
        }

        if (!customerInfo || !customerInfo.fullName || !customerInfo.address || !customerInfo.phone) {
            return res.status(400).json({ message: 'Missing customer details' });
        }

        const data = getProducts();
        let totalAmount = 0;

        for (const item of items) {
            const product = data.products.find(p => p.id == item.id);
            if (!product) {
                return res.status(404).json({ message: `Product ${item.id} not found` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${product.title}` });
            }
            totalAmount += product.price * item.quantity;
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

        // Save Order to Database
        let dbOrder = null;
        try {
            const dbOrderData = {
                name: customerInfo.fullName,
                phone: customerInfo.phone,
                address: customerInfo.address
            };
            dbOrder = await createOrderDB(dbOrderData);
            console.log("Order saved to DB:", dbOrder);
        } catch (dbErr) {
            console.error("Failed to save order to DB:", dbErr);
            // Optionally decide if we should fail the request or just log it. 
            // For now, proceeding as we still save to JSON.
        }

        // Save Order History (JSON)
        const orders = getOrders();
        const newOrder = {
            id: dbOrder ? dbOrder.order_id : Date.now().toString(), // Use DB ID if available
            customerInfo,
            items,
            totalAmount,
            status: status || 'Pending',
            createdAt: new Date().toISOString()
        };
        orders.push(newOrder);
        saveOrders(orders);

        res.json({ message: 'Order placed successfully', orderId: newOrder.id });
    } catch (err) {
        console.error("Error placing order:", err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.getAllOrders = (req, res) => {
    try {
        const orders = getOrders();
        res.json(orders);
    } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
