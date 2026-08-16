const { v4: uuidv4 } = require('uuid');

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