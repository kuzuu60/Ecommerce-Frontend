const pool = require('./db');

const saveOrderDb = async (order) => {
    const query = `INSERT INTO orders (order_id, name, phone, address, items, total_amount, status, created_at)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;
    const values = [
        order.id,
        order.name,
        order.phone,
        order.address,
        JSON.stringify(order.items),
        order.totalAmount,
        order.status,
        order.createdAt
    ];
    return pool.query(query, values);
};

const getOrdersDb = async () => {
    return pool.query('SELECT * FROM orders ORDER BY created_at DESC');
};

module.exports = {
    saveOrderDb,
    getOrdersDb
};
