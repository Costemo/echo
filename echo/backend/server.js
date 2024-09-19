
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');

dotenv.config();

const authRoutes = require('./Routes/auth');
const userRoutes = require('./Routes/user');
const eSpaceRoutes = require('./Routes/eSpaces');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/espaces', eSpaceRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const testDbConnection = async () => {
    try {
        await db.one('SELECT 1');
        console.log('Database connection successful');
    } catch (error) {
        console.error('Database connection error:', error.message || error);
        process.exit(1); 
    }
};

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await testDbConnection(); 
});
