const { Pool } = require('pg');
const pool = new Pool();

// Add a new comment
exports.addComment = async (req, res) => {
    const { postId, userId, comment } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO comments (post_id, user_id, comment) VALUES ($1, $2, $3) RETURNING *',
            [postId, userId, comment]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add comment' });
    }
};

// Get comments for a post
exports.getComments = async (req, res) => {
    const { postId } = req.params;
    try {
        const result = await pool.query('SELECT * FROM comments WHERE post_id = $1', [postId]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to get comments' });
    }
};
