module.exports = (db) => {

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// const pgp = require('pg-promise')();
const router = express.Router();

// const db = pgp({
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     database: process.env.DB_NAME,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
// });


const saltRounds = 10;
const secret = process.env.JWT_SECRET;

router.post('/login', async (req, res) => {
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

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await db.oneOrNone('SELECT * FROM users WHERE username = $1', [username]);
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ id: user.id, username: user.username }, secret, { expiresIn: '1h' });
            res.json({ token });
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (error) {
        console.error('ERROR', error.message || error);
        res.status(500).send('Server error');
    }
});

return router;
};