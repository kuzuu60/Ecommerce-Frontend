const fs = require('fs');
const path = require('path');

const productsFilePath = path.join(__dirname, 'data', 'products.json');

try {
    const rawData = fs.readFileSync(productsFilePath, 'utf8');
    const data = JSON.parse(rawData);

    const categories = {};
    data.products.forEach(p => {
        categories[p.category] = (categories[p.category] || 0) + 1;
    });

    console.log("Current Categories in Database:");
    console.table(categories);

} catch (err) {
    console.error(err);
}
