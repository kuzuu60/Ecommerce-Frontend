const fs = require('fs');
const path = require('path');

const productsFilePath = path.join(__dirname, '..', 'data', 'products.json');

const getProducts = () => {
    try {
        const data = fs.readFileSync(productsFilePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading products file:", err);
        return { products: [] };
    }
};

const saveProducts = (data) => {
    try {
        fs.writeFileSync(productsFilePath, JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error("Error saving products file:", err);
        return false;
    }
};

module.exports = {
    getProducts,
    saveProducts
};
