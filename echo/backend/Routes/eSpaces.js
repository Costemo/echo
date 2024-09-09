const express = require('express');
const authenticate = require('./auth');

const router = express.Router();

router.use((req, res, next) => {
    req.db = req.app.get('db');
    next();
});

router.post('/add', authenticate, async (req, res) => {
    const { name, description } = req.body;
    console.log('Received body:', req.body); 

    try {
        if (!name || !description) {
            return res.status(400).send('Name and description are required');
        }

        const result = await req.db.any(
            `INSERT INTO e_spaces (name, description, created_by) VALUES ($1, $2, $3) RETURNING *`,
            [name, description, req.user.id]
        );

        console.log('Insert result:', result); 
        
        res.status(201).json(result[0]);
    } catch (err) {
        console.error('Error in /add route:', err.message, err.stack); 
        res.status(500).send(`Server error: ${err.message}`);
    }
});


router.get('/', authenticate, async (req, res) => {
    try {
        const spaces = await req.db.any('SELECT * FROM e_spaces');
        console.log('Query Result:', spaces); 
        res.json(spaces); 
    } catch (err) {
        console.error('Error in /get route:', err.message, err.stack);
        res.status(500).send('Server error');
    }
});

router.delete('/:id', authenticate, async (req, res) => {
    const spaceId = req.params.id;
    const userId = req.user.id;

    try {
        const space = await req.db.any('SELECT * FROM e_spaces WHERE id = $1 AND created_by = $2', [spaceId, userId]);

        if (space.length === 0) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await req.db.none('DELETE FROM e_spaces WHERE id = $1', [spaceId]);
        res.json({ msg: 'e.Space deleted' });
    } catch (err) {
        console.error(err.message, err.stack);
        res.status(500).send('Server error');
    }
});

module.exports = router;
