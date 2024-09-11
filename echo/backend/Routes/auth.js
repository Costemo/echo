module.exports = (db) => {

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

const saltRounds = 10;
const secret = process.env.JWT_SECRET;

if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}

const authenticate = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader; 

    if (!token) {
        return res.status(401).send('Access denied. No token provided.');
    }

    try {
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (ex) {
        res.status(401).send('Invalid token.');
    }
};

module.exports = authenticate;

router.get('/users/search', authenticate, async (req, res) => {
    const query = req.query.q;
    try {
        const users = await db.any('SELECT id, username FROM users WHERE username ILIKE $1', [`%${query}%`]);
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Server error');
    }
});

router.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        await db.none('INSERT INTO users(username, password) VALUES($1, $2)', [username, hashedPassword]);
        res.status(201).send('User Created');
    } catch (error) {
        console.error('ERROR:', error.message || error);
        res.status(500).send('Server error');
    }
});

router.post('/signin', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await db.oneOrNone('SELECT * FROM users WHERE username = $1', [username]);
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                const token = jwt.sign({ id: user.id, username: user.username }, secret, { expiresIn: '1h' });
                res.json({ token, userId: user.id }); // Include userId in response
            } else {
                console.log("Invalid Credentials");
                res.status(401).send('Invalid credentials');
            }
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (error) {
        console.error('ERROR:', error.message || error);
        res.status(500).send('Server error');
    }
});


return router;
};

