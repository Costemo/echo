require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pgp = require('pg-promise')();
const QueryStream = require('pg-query-stream');
const JSONStream = require('JSONStream');
const jwt = require('jsonwebtoken');



const app = express();
const PORT = process.env.PORT || 5000;

const db = pgp({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

db.connect()
.then(obj => {
    console.log('Connected to the database');
    obj.done();
})
.catch(error => {
    console.log('ERROR', error.message || error);
});

app.use(cors());
app.use(express.json());

app.get('/stream-data', (req, res) => {
    const qs = new QueryStream('SELECT * FROM groups');
    db.stream(qs, s => {
        s.pipe(JSONStream.stringify()).pipe(res);
    })
    .catch(error => {
        console.log('ERROR:', error.message || error);
        res.status(500).send('Something went wrong');
    });
});

const authRoutes = require('./Routes/auth.js')(db);

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to Echo Backend');
});

app.get('/api/groups', (req, res) => {
    db.any('SELECT * FROM groups')
        .then(data => {
            console.log('ERROR:', error.message || error);
            res.status(500).send('Something went wrong');
        });
});

app.get('/api/groups/:id', (req, res) => {
    const groupId = req.params.id;
    db.oneOrNone('SELECT * FROM groups WHERE id = $1', [groupId])
        .then(group => {
            if (group) {
                res.json(group);
            } else {
                res.status(404).send('Group not found');
            }
        })
        .catch(error => {
            console.log('ERROR', error.message || error);
            res.status(500).send('Something went wrong');
        });
});

module.exports = db;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});