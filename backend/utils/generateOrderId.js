const { v4: uuidv4 } = require('uuid');

function generateOrderId() {
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD-${randomStr}`;
}

module.exports = generateOrderId;
