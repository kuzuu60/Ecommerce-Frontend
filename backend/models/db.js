const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});
pool.connect()
    .then(client => {
        console.log("✅ Connected to PostgreSQL");
        client.release();
    })
    .catch(err => {
        console.error('❌ Database connection failed');
        console.error(err);
    });

module.exports = pool;