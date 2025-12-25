const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
const generateOrderId = require('../utils/generateOrderId'); // your UUID generator

// Create a new application
async function createOrder(app) {
  const order_id = generateOrderId(); // generate UUID here

  const res = await pool.query(`INSERT INTO orders
      (order_id, name, phone, address)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
     [order_id, app.name, app.phone, app.address]);

  return res.rows[0];
  }

  module.exports = {
    createOrder
  };        