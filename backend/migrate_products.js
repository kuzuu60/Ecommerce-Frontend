const path = require('path');
const fs = require('fs');
const pool = require('./models/db');
const { buildProductSpecs } = require('./utils/productFeatures');

const productsFilePath = path.join(__dirname, 'data', 'products.json');

const migrate = async () => {
  try {
    console.log('Reading products.json...');
    const data = fs.readFileSync(productsFilePath, 'utf8');
    const { products } = JSON.parse(data);
    console.log(`Found ${products.length} products to migrate.`);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      console.log('Starting migration...');

      for (const p of products) {
        const queryText = `
          INSERT INTO products (
            id, title, description, specs, category, price, discount_percentage,
            rating, stock, brand, sku, weight, warranty_information,
            shipping_information, availability_status, thumbnail,
            images, reviews, dimensions
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            specs = EXCLUDED.specs,
            category = EXCLUDED.category,
            price = EXCLUDED.price,
            discount_percentage = EXCLUDED.discount_percentage,
            rating = EXCLUDED.rating,
            stock = EXCLUDED.stock,
            brand = EXCLUDED.brand,
            sku = EXCLUDED.sku,
            weight = EXCLUDED.weight,
            warranty_information = EXCLUDED.warranty_information,
            shipping_information = EXCLUDED.shipping_information,
            availability_status = EXCLUDED.availability_status,
            thumbnail = EXCLUDED.thumbnail,
            images = EXCLUDED.images,
            reviews = EXCLUDED.reviews,
            dimensions = EXCLUDED.dimensions;
        `;

        const values = [
          p.id,
          p.title,
          p.description || '',
          buildProductSpecs(p),
          p.category,
          p.price,
          p.discountPercentage || 0,
          p.rating || 0,
          p.stock || 0,
          p.brand || 'Generic',
          p.sku || '',
          p.weight || 0,
          p.warrantyInformation || '',
          p.shippingInformation || '',
          p.availabilityStatus || 'In Stock',
          p.thumbnail || '',
          JSON.stringify(p.images || []),
          JSON.stringify(p.reviews || []),
          JSON.stringify(p.dimensions || {})
        ];

        await client.query(queryText, values);
      }

      console.log('Resetting serial sequence nextval...');
      await client.query("SELECT setval('products_id_seq', (SELECT MAX(id) FROM products))");

      await client.query('COMMIT');
      console.log('✅ Migration completed successfully!');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('❌ Error executing migration:', err);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await pool.end();
    process.exit(0);
  }
};

migrate();
