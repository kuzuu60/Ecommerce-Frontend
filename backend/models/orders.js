// Order model - simplified for JSON-based storage
const { v4: uuidv4 } = require('uuid');

// Create a new order (returns order object without DB call)
function createOrder(app) {
  const order_id = uuidv4();

  return {
    order_id,
    name: app.name,
    phone: app.phone,
    address: app.address,
    created_at: new Date().toISOString()
  };
}

module.exports = {
  createOrder
};        