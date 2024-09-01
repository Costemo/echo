const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to Echo Backend');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});