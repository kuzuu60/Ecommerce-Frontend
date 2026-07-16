const pool = require('../models/db');
const { getOrdersDb } = require('../models/orderModel');
const { v4: uuidv4 } = require('uuid');

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
            name: customerInfo.fullName,
            phone: customerInfo.phone,
            address: customerInfo.address,
            items,
            totalAmount,
            status: status || 'Pending',
            createdAt: new Date().toISOString()
        };

        const insertQuery = `
            INSERT INTO orders (order_id, name, phone, address, items, total_amount, status, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
        `;
        await client.query(insertQuery, [
            orderData.id,
            orderData.name,
            orderData.phone,
            orderData.address,
            JSON.stringify(orderData.items),
            orderData.totalAmount,
            orderData.status,
            orderData.createdAt
        ]);

        await client.query('COMMIT');
        res.json({ message: 'Order placed successfully', orderId: orderData.id });
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
