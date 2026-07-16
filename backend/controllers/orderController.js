const pool = require('../models/db');
const { getOrdersDb } = require('../models/orderModel');
const { v4: uuidv4 } = require('uuid');

const FREE_SHIPPING_THRESHOLD = 5000;
const SHIPPING_FEE_PER_LINE = 100;

exports.createOrder = async (req, res) => {
    const client = await pool.connect();
    try {
        const { items, customerInfo, status } = req.body;
        console.log("Received Order:", items, "Customer:", customerInfo, "Status:", status);

        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ message: 'Invalid order items' });
        }

        if (!customerInfo || !customerInfo.fullName || !customerInfo.address || !customerInfo.phone) {
            return res.status(400).json({ message: 'Missing customer details' });
        }

        await client.query('BEGIN');

        let totalAmount = 0;
        const verifiedItems = [];

        // Validate items and check stock
        for (const item of items) {
            const productRes = await client.query('SELECT * FROM products WHERE id = $1', [item.id]);
            if (productRes.rowCount === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ message: `Product ${item.id} not found` });
            }
            const product = productRes.rows[0];
            if (product.stock < item.quantity) {
                await client.query('ROLLBACK');
                return res.status(400).json({ message: `Insufficient stock for ${product.title}` });
            }
            totalAmount += Number(product.price) * item.quantity;
            verifiedItems.push({
                product,
                quantity: item.quantity
            });
        }

        const subtotal = totalAmount;
        const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD
            ? 0
            : verifiedItems.length * SHIPPING_FEE_PER_LINE;
        totalAmount = subtotal + shippingCost;

        // Deduct stock
        for (const verified of verifiedItems) {
            const { product, quantity } = verified;
            const newStock = product.stock - quantity;
            let availabilityStatus = 'In Stock';
            if (newStock <= 0) {
                availabilityStatus = 'Out of Stock';
            } else if (newStock < 10) {
                availabilityStatus = 'Low Stock';
            }

            await client.query(
                'UPDATE products SET stock = $1, availability_status = $2 WHERE id = $3',
                [newStock, availabilityStatus, product.id]
            );
        }

        // Generate Order ID
        const orderId = `ORD-${uuidv4().slice(0, 8).toUpperCase()}`;

        // Save order to DB
        const orderData = {
            id: orderId,
            userId: req.user.id,
            name: customerInfo.fullName,
            phone: customerInfo.phone,
            address: customerInfo.address,
            items,
            totalAmount,
            status: status || 'Pending',
            createdAt: new Date().toISOString()
        };

        const insertQuery = `
            INSERT INTO orders (order_id, user_id, name, phone, address, items, total_amount, status, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
        `;
        await client.query(insertQuery, [
            orderData.id,
            orderData.userId,
            orderData.name,
            orderData.phone,
            orderData.address,
            JSON.stringify(orderData.items),
            orderData.totalAmount,
            orderData.status,
            orderData.createdAt
        ]);

        await client.query('COMMIT');
        res.json({
            message: 'Order placed successfully',
            orderId: orderData.id,
            subtotal,
            shippingCost,
            totalAmount
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error placing order:", err);
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        client.release();
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const { rows } = await getOrdersDb();
        const orders = rows.map(order => ({
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
        res.json(orders);
    } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT order_id, name, phone, address, items, total_amount, status, created_at
             FROM orders
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [req.user.id]
        );

        const orders = rows.map(order => ({
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

        res.json(orders);
    } catch (err) {
        console.error('Error fetching user orders:', err);
        res.status(500).json({ message: 'Unable to load your orders' });
    }
};

exports.updateOrderStatus = async (req, res) => {
    const allowedStatuses = ['Pending', 'Paid', 'Confirmed', 'Shipped', 'Delivered'];
    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid order status' });
    }

    try {
        const { rows } = await pool.query(
            'UPDATE orders SET status = $1 WHERE order_id = $2 RETURNING order_id, status',
            [status, req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json({ message: 'Order status updated', orderId: rows[0].order_id, status: rows[0].status });
    } catch (err) {
        console.error('Error updating order status:', err);
        res.status(500).json({ message: 'Unable to update order status' });
    }
};
