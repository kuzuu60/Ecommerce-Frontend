const { Pool } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '../.env'), override: true });

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1' ? { rejectUnauthorized: false } : false
});

const schemaPath = path.join(__dirname, 'schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');

const seedAdmin = async (client) => {
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;

    if (!username || !password) {
        console.warn('⚠️ ADMIN_USERNAME or ADMIN_PASSWORD not set, skipping admin seed');
        return;
    }

    const existing = await client.query('SELECT id FROM admins WHERE username = $1', [username]);
    if (existing.rowCount === 0) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await client.query(
            'INSERT INTO admins (username, password, role) VALUES ($1, $2, $3)',
            [username, hashedPassword, 'admin']
        );
        console.log('✅ Seeded default admin user');
    }
};

pool.connect()
    .then(async (client) => {
        try {
            await client.query(schemaSql);
            await seedAdmin(client);
            console.log('✅ Connected to PostgreSQL');
        } catch (err) {
            console.error('❌ Database initialization failed');
            console.error(err);
        } finally {
            client.release();
        }
    })
    .catch(err => {
        console.error('❌ Database connection failed');
        console.error(err);
    });

module.exports = pool;