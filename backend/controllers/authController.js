const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), override: true });
const pool = require('../models/db');

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

exports.register = async (req, res) => {
    const { fullName, email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!fullName?.trim() || !normalizedEmail || !password) {
        return res.status(400).json({ message: 'Full name, email, and password are required' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    try {
        const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
        if (existingUser.rowCount > 0) {
            return res.status(409).json({ message: 'An account with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const { rows } = await pool.query(
            'INSERT INTO users (full_name, email, password) VALUES ($1, $2, $3) RETURNING id, full_name, email, is_active',
            [fullName.trim(), normalizedEmail, hashedPassword]
        );

        const user = rows[0];
        const token = jwt.sign(
            { id: user.id, email: user.email, role: 'user' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(201).json({
            token,
            user: { id: user.id, fullName: user.full_name, email: user.email }
        });
    } catch (err) {
        console.error('Error during user registration:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.userLogin = async (req, res) => {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const { rows } = await pool.query(
            'SELECT id, full_name, email, password, is_active FROM users WHERE email = $1',
            [normalizedEmail]
        );
        if (rows.length === 0 || !(await bcrypt.compare(password, rows[0].password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = rows[0];
        if (!user.is_active) {
            return res.status(403).json({ message: 'Your account has been suspended' });
        }
        const token = jwt.sign(
            { id: user.id, email: user.email, role: 'user' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.json({
            token,
            user: { id: user.id, fullName: user.full_name, email: user.email }
        });
    } catch (err) {
        console.error('Error during user login:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
