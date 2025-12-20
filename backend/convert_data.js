const fs = require('fs');
const path = require('path');

const productsFilePath = path.join(__dirname, 'data', 'products.json');

// Categories currently in the Navbar
const allowedCategories = [
    'laptops',
    'smartphones',
    'tablets',
    'mobile-accessories',
    'home-decoration',
    'furniture',
    'kitchen-accessories',
    'sports-accessories',
    'sunglasses'
];

try {
    const rawData = fs.readFileSync(productsFilePath, 'utf8');
    const data = JSON.parse(rawData);

    console.log(`Original Count: ${data.products.length}`);

    // Filter and Convert
    const processedProducts = data.products
        .filter(p => allowedCategories.includes(p.category))
        .map(p => {
            // Check if price looks like it's already converted (e.g. > 2000)
            // If it's small (like < 2000), assume it's USD and convert.
            // This prevents double conversion if run twice.
            let newPrice = p.price;
            if (p.price < 3000) {
                newPrice = Math.round(p.price * 135);
            }
            return { ...p, price: newPrice };
        });

    console.log(`New Count: ${processedProducts.length}`);

    const newData = { ...data, products: processedProducts };
    fs.writeFileSync(productsFilePath, JSON.stringify(newData, null, 2));

    console.log("Success! Data filtered and prices converted to NPR.");

} catch (err) {
    console.error(err);
}
