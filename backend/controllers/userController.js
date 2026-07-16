const pool = require('../models/db');

const mapOrder = (order) => ({
    id: order.order_id,
    customerInfo: {
        fullName: order.name,
        phone: order.phone,
        address: order.address
    },
    items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
    totalAmount: parseFloat(order.total_amount),
    status: order.status,
    createdAt: order.created_at
});

exports.getUsers = async (req, res) => {
    const { search = '', status = 'all' } = req.query;
    const conditions = [];
    const values = [];

    if (search.trim()) {
        values.push(`%${search.trim()}%`);
        conditions.push(`(u.full_name ILIKE $${values.length} OR u.email ILIKE $${values.length})`);
    }

    if (status === 'active' || status === 'suspended') {
        values.push(status === 'active');
        conditions.push(`u.is_active = $${values.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    try {
        const { rows } = await pool.query(`
            SELECT
                u.id,
                u.full_name,
                u.email,
                u.is_active,
                u.created_at,
                COUNT(o.order_id)::INT AS order_count,
                COALESCE(SUM(o.total_amount), 0)::NUMERIC AS total_spent
            FROM users u
            LEFT JOIN orders o ON o.user_id = u.id
            ${whereClause}
            GROUP BY u.id
            ORDER BY u.created_at DESC
        `, values);

        res.json(rows.map(user => ({
            id: user.id,
            fullName: user.full_name,
            email: user.email,
            isActive: user.is_active,
            createdAt: user.created_at,
            orderCount: user.order_count,
            totalSpent: parseFloat(user.total_spent)
        })));
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ message: 'Unable to load users' });
    }
};

exports.getUserDetails = async (req, res) => {
    try {
        const userResult = await pool.query(`
            SELECT
                u.id,
                u.full_name,
                u.email,
                u.is_active,
                u.created_at,
                COUNT(o.order_id)::INT AS order_count,
                COALESCE(SUM(o.total_amount), 0)::NUMERIC AS total_spent
            FROM users u
            LEFT JOIN orders o ON o.user_id = u.id
            WHERE u.id = $1
            GROUP BY u.id
        `, [req.params.id]);

        if (userResult.rowCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const orderResult = await pool.query(
            'SELECT order_id, name, phone, address, items, total_amount, status, created_at FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
            [req.params.id]
        );
        const user = userResult.rows[0];

        res.json({
            user: {
                id: user.id,
                fullName: user.full_name,
                email: user.email,
                isActive: user.is_active,
                createdAt: user.created_at,
                orderCount: user.order_count,
                totalSpent: parseFloat(user.total_spent)
            },
            orders: orderResult.rows.map(mapOrder)
        });
    } catch (err) {
        console.error('Error fetching user details:', err);
        res.status(500).json({ message: 'Unable to load user details' });
    }
};

exports.updateUserStatus = async (req, res) => {
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: 'isActive must be a boolean' });
    }

    try {
        const { rows } = await pool.query(
            'UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id, full_name, email, is_active',
            [isActive, req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: isActive ? 'User activated successfully' : 'User suspended successfully',
            user: {
                id: rows[0].id,
                fullName: rows[0].full_name,
                email: rows[0].email,
                isActive: rows[0].is_active
            }
        });
    } catch (err) {
        console.error('Error updating user status:', err);
        res.status(500).json({ message: 'Unable to update user status' });
    }
};
