const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../models/db');
require('dotenv').config();

exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const { rows } = await pool.query('SELECT username, password, role FROM admins WHERE username = $1', [username]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const admin = rows[0];
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ username: admin.username, role: admin.role }, process.env.JWT_SECRET, {
            expiresIn: '8h'
        });

        res.json({ token, user: { username: admin.username, role: admin.role } });
    } catch (err) {
        console.error('Error during admin login:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
