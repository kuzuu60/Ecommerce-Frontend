const fs = require('fs');
const path = require('path');
const pool = require('./models/db');
const { buildProductSpecs } = require('./utils/productFeatures');

const productsJsonPath = path.join(__dirname, 'data', 'products.json');
const productsCsvPath = path.join(__dirname, 'data', 'products.csv');

const escapeCsv = (value) => {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const syncProductFeatures = async () => {
  const source = JSON.parse(fs.readFileSync(productsJsonPath, 'utf8'));
  const tagsById = new Map(source.products.map((product) => [product.id, product.tags || []]));
  const client = await pool.connect();

  try {
    const result = await client.query(`
      SELECT id, title, category, brand, description, price
      FROM products
      ORDER BY id
    `);

    await client.query('BEGIN');
    await client.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS specs TEXT');

    const rows = result.rows.map((product) => ({
      ...product,
      specs: buildProductSpecs(product, tagsById.get(product.id) || [])
    }));

    for (const product of rows) {
      await client.query('UPDATE products SET specs = $1 WHERE id = $2', [product.specs, product.id]);
    }

    await client.query('COMMIT');

    const header = ['id', 'name', 'category', 'brand', 'description', 'price', 'specs'];
    const csv = [
      header.join(','),
      ...rows.map((product) => [
        product.id,
        product.title,
        product.category,
        product.brand,
        product.description,
        product.price,
        product.specs
      ].map(escapeCsv).join(','))
    ].join('\n');

    fs.writeFileSync(productsCsvPath, `${csv}\n`);
    console.log(`Synced ${rows.length} products and wrote ${productsCsvPath}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

syncProductFeatures().catch((error) => {
  console.error('Product feature sync failed:', error.message);
  process.exitCode = 1;
});
