const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: path.join(__dirname, '.env'), override: true });

const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const authRoutes = require('./routes/authRoutes');
const qaRoutes = require('./routes/qaRoutes');
const userRoutes = require('./routes/userRoutes');
const mockEsewaRoutes = require('./routes/mockEsewaRoutes');

const app = express();
const DEFAULT_PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
const MAX_PORT_ATTEMPTS = 10;

require('./models/db');

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" } // allows serving images to frontend
}));
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
}));
app.use(express.json());

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Generous limit for normal API usage
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(globalLimiter);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Stricter limit for auth routes
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/qa', qaRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api/esewa', mockEsewaRoutes);

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
