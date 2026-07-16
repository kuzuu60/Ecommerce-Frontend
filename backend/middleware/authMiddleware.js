const path = require('path');
const jwt = require('jsonwebtoken');
const pool = require('../models/db');
require('dotenv').config({ path: path.join(__dirname, '../.env'), override: true });

const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        if (!payload || payload.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        req.admin = payload;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

const authenticateUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Please sign in to continue' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        if (!payload || payload.role !== 'user') {
            return res.status(403).json({ message: 'Customer account required' });
        }

        const userResult = await pool.query('SELECT is_active FROM users WHERE id = $1', [payload.id]);
        if (userResult.rowCount === 0) {
            return res.status(401).json({ message: 'Customer account not found' });
        }
        if (!userResult.rows[0].is_active) {
            return res.status(403).json({ message: 'Your account has been suspended' });
        }

        req.user = payload;
        next();
    } catch (err) {
        console.error('Error checking customer account:', err);
        if (err.name !== 'JsonWebTokenError' && err.name !== 'TokenExpiredError') {
            return res.status(500).json({ message: 'Unable to verify customer account' });
        }
        return res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
    }
};

module.exports = {
    authenticateAdmin,
    authenticateUser
};
