const db = require('../db'); 
require('dotenv').config();

const createESpacePost = async (req, res) => {
    const { title, body } = req.body;
    const userId = req.user.id;
    const spaceId = req.params.spaceId;

    if (!title && !body) {
        return res.status(400).json({ message: 'Post must have a title or body' });
    }

    try {
        const newPost = await db.one(
            'INSERT INTO posts (user_id, title, body, space_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, title, body, spaceId]
        );
        res.status(201).json(newPost);
    } catch (error) {
        console.error('Error creating eSpace post:', error.message, error.stack);
        res.status(500).send('Server error');
    }
};

const getESpacePosts = async (req, res) => {
    const spaceId = req.params.spaceId;

    try {
        const posts = await db.any('SELECT * FROM posts WHERE space_id = $1', [spaceId]);
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching eSpace posts:', error.message);
        res.status(500).send('Server error');
    }
};




const addESpace = async (req, res) => {
    const { name, description } = req.body;
    try {
        await db.none('INSERT INTO e_spaces(name, description) VALUES($1, $2)', [name, description]);
        res.status(201).json({ message: 'eSpace Created' });
    } catch (error) {
        console.error('Error adding eSpace:', error.message, error.stack);
        res.status(500).json({ message: 'Server error' });
    }
};


const getESpaces = async (req, res) => {
    try {
        const espaces = await db.any('SELECT * FROM e_spaces');
        res.json(espaces);
    } catch (error) {
        console.error('Error fetching eSpaces:', error.message, error.stack);
        res.status(500).json({ error: 'Server error' });
    }
};

const getESpaceById = async (req, res) => {
    const { id } = req.params;
    try {
        const eSpace = await db.oneOrNone('SELECT * FROM e_spaces WHERE id = $1', [id]);
        if (!eSpace) return res.status(404).json({ error: 'eSpace not found' });
        res.json(eSpace);
    } catch (error) {
        console.error('Error fetching eSpace:', error.message, error.stack);
        res.status(500).json({ error: 'Server error' });
    }
};

const updateESpace = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    try {
        await db.none('UPDATE e_spaces SET name = $1, description = $2 WHERE id = $3', [name, description, id]);
        res.send('eSpace Updated');
    } catch (error) {
        console.error('Error updating eSpace:', error.message, error.stack);
        res.status(500).json({ error: 'Server error' });
    }
};

const deleteESpace = async (req, res) => {
    const { id } = req.params;
    try {
        await db.none('DELETE FROM e_spaces WHERE id = $1', [id]);
        res.send('eSpace Deleted');
    } catch (error) {
        console.error('Error deleting eSpace:', error.message, error.stack);
        res.status(500).json({ error: 'Server error' });
    }
};

const searchESpaces = async (req, res) => {
    const query = req.query.q;
    try {
        const eSpaces = await db.any('SELECT id, name FROM e_spaces WHERE name ILIKE $1', [`%${query}%`]);
        res.json(eSpaces);
    } catch (error) {
        console.error('Error fetching eSpaces:', error.message, error.stack);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    addESpace,
    getESpaces,
    getESpaceById,
    updateESpace,
    deleteESpace,
    searchESpaces,
    createESpacePost,
    getESpacePosts,
};
