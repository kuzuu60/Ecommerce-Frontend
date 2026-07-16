const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env'), override: true });

const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const authRoutes = require('./routes/authRoutes');
const qaRoutes = require('./routes/qaRoutes');

const app = express();
const DEFAULT_PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
const MAX_PORT_ATTEMPTS = 10;

require('./models/db');

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/qa', qaRoutes);

const startServer = (port, attempt = 1) => {
    const server = app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE' && attempt < MAX_PORT_ATTEMPTS) {
            console.warn(`Port ${port} in use, trying ${port + 1}...`);
            startServer(port + 1, attempt + 1);
        } else {
            console.error(err);
            process.exit(1);
        }
    });
};

startServer(DEFAULT_PORT);
