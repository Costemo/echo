const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db'); // Import your db instance
require('dotenv').config();

const saltRounds = 10;
const secret = process.env.JWT_SECRET;

if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}

const signUp = async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        await db.none('INSERT INTO users(username, password) VALUES($1, $2)', [username, hashedPassword]);
        res.status(201).send('User Created');
    } catch (error) {
        console.error('ERROR:', error.message || error);
        res.status(500).send('Server error');
    }
};

const signIn = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await db.oneOrNone('SELECT * FROM users WHERE username = $1', [username]);
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                const token = jwt.sign({ id: user.id, username: user.username }, secret, { expiresIn: '1h' });
                res.json({ token, userId: user.id });
            } else {
                res.status(401).send('Invalid credentials');
            }
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (error) {
        console.error('ERROR:', error.message || error);
        res.status(500).send('Server error');
    }
};

module.exports = {
    signUp,
    signIn
};
