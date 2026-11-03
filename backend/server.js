const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = 'your_super_secret_campus_key';

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access token required' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = user;
        next();
    });
};

// Auth: Signup
app.post('/api/auth/signup', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required' });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run(
            `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
            [name, email, hashedPassword],
            function (err) {
                if (err) return res.status(400).json({ error: 'Email already registered' });
                const token = jwt.sign({ id: this.lastID, email, name }, JWT_SECRET, { expiresIn: '7d' });
                res.status(201).json({ message: 'User registered successfully', token, user: { id: this.lastID, name, email } });
            }
        );
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Auth: Login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (err || !user) return res.status(400).json({ error: 'Invalid email or password' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Invalid email or password' });

        const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email } });
    });
});

// Get Items
app.get('/api/items', (req, res) => {
    const { category, status, search } = req.query;
    let query = `SELECT items.*, users.name as uploader_name FROM items JOIN users ON items.user_id = users.id WHERE is_resolved = 0`;
    let params = [];

    if (category) { query += ` AND category = ?`; params.push(category); }
    if (status) { query += ` AND status = ?`; params.push(status); }
    if (search) {
        query += ` AND (title LIKE ? OR description LIKE ? OR location LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY created_at DESC`;
    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Post Item & Trigger Smart Match
app.post('/api/items', authenticateToken, async (req, res) => {
    const { title, description, category, status, location, secret_question, secret_answer } = req.body;
    if (!title || !description || !category || !status || !location || !secret_question || !secret_answer) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const hashedAnswer = await bcrypt.hash(secret_answer.toLowerCase().trim(), 10);

        db.run(
            `INSERT INTO items (user_id, title, description, category, status, location, secret_question, secret_answer) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.user.id, title, description, category, status, location, secret_question, hashedAnswer],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });

                const newItemId = this.lastID;
                const oppositeStatus = status === 'lost' ? 'found' : 'lost';
                const keyword = `%${title.split(' ')[0]}%`;

                const matchQuery = `SELECT * FROM items WHERE status = ? AND category = ? AND is_resolved = 0 AND (title LIKE ? OR description LIKE ?)`;

                db.all(matchQuery, [oppositeStatus, category, keyword, keyword], (matchErr, matches) => {
                    if (!matchErr && matches.length > 0) {
                        matches.forEach((match) => {
                            if (match.user_id !== req.user.id) {
                                const notifMsg = `Potential match found for your ${oppositeStatus} item "${match.title}"! Check item #${newItemId}.`;
                                db.run(`INSERT INTO notifications (user_id, message) VALUES (?, ?)`, [match.user_id, notifMsg]);
                            }
                        });
                    }
                });

                res.status(201).json({ message: 'Item posted successfully with smart matching enabled!', itemId: newItemId });
            }
        );
    } catch (err) {
        res.status(500).json({ error: 'Server error processing secret answer' });
    }
});

// Claim Item Securely
app.post('/api/items/:id/claim', authenticateToken, (req, res) => {
    const itemId = req.params.id;
    const { answer } = req.body;

    db.get(`SELECT * FROM items WHERE id = ?`, [itemId], async (err, item) => {
        if (err || !item) return res.status(404).json({ error: 'Item not found' });
        if (item.is_resolved) return res.status(400).json({ error: 'This item has already been resolved.' });

        const isMatch = await bcrypt.compare(answer.toLowerCase().trim(), item.secret_answer);
        if (!isMatch) {
            return res.status(400).json({ success: false, error: 'Incorrect answer to security question.' });
        }

        db.get(`SELECT name, email FROM users WHERE id = ?`, [item.user_id], (userErr, uploader) => {
            if (userErr) return res.status(500).json({ error: 'Database error' });

            db.run(`UPDATE items SET is_resolved = 1 WHERE id = ?`, [itemId]);

            res.json({
                success: true,
                message: 'Claim verified successfully!',
                uploader
            });
        });
    });
});

// Get Notifications
app.get('/api/notifications', authenticateToken, (req, res) => {
    db.all(`SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC`, [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));