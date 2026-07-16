const { getProducts, saveProducts, getOrders, saveOrders } = require('../utils/dataHandler');
const { createOrder } = require('../models/orders');
const { saveOrderDb, getOrdersDb } = require('../models/orderModel');

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

        // Create order object
        const orderData = {
            name: customerInfo.fullName,
            phone: customerInfo.phone,
            address: customerInfo.address
        };
        const createdOrder = createOrder(orderData);

        // Save Order History (JSON)
        const orders = getOrders();
        const newOrder = {
            id: createdOrder.order_id,
            customerInfo,
            items,
            totalAmount,
            status: status || 'Pending',
            createdAt: new Date().toISOString()
        };
        orders.push(newOrder);
        saveOrders(orders);

        try {
            await saveOrderDb({
                id: newOrder.id,
                name: customerInfo.fullName,
                phone: customerInfo.phone,
                address: customerInfo.address,
                items,
                totalAmount,
                status: newOrder.status,
                createdAt: newOrder.createdAt
            });
        } catch (dbErr) {
            console.error('Error saving order to database:', dbErr);
        }

        res.json({ message: 'Order placed successfully', orderId: newOrder.id });
    } catch (err) {
        console.error("Error placing order:", err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.getAllOrders = async (req, res) => {
    try {
        let orders = getOrders();
        try {
            const { rows } = await getOrdersDb();
            orders = rows.map(order => ({
                id: order.order_id,
                customerInfo: {
                    fullName: order.name,
                    phone: order.phone,
                    address: order.address
                },
                items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
                totalAmount: parseFloat(order.total_amount),
                status: order.status,
                createdAt: order.created_at
            }));
        } catch (dbErr) {
            console.error('Error reading orders from DB:', dbErr);
        }
        res.json(orders);
    } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
