const express = require('express');
const router = express.Router();

module.exports = (db) => {
    const authenticate = require('./auth');

    // Search for users based on the username
    router.get('/search', authenticate, async (req, res) => {
        const { query } = req.query;
        try {
            const users = await db.any('SELECT id, username FROM users WHERE username ILIKE $1', [`%${query}%`]);
            res.json(users);
        } catch (error) {
            console.error('Error searching users:', error);
            res.status(500).send('Server error');
        }
    });

// Fetch a specific user by ID
router.get('/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    console.log(`Fetching user with ID: ${id}`);  // Debugging log
    try {
        const user = await db.oneOrNone('SELECT id, username FROM users WHERE id = $1', [id]);
        if (!user) return res.status(404).send('User not found');
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).send('Server error');
    }
});


    // Follow a user
    router.post('/:id/follow', authenticate, async (req, res) => {
        const { id } = req.params;
        try {
            // Ensure the followers table exists before using it
            await db.none('INSERT INTO followers (follower_id, followed_id) VALUES ($1, $2)', [req.user.id, id]);
            res.send('Followed');
        } catch (error) {
            console.error('Error following user:', error);
            res.status(500).send('Server error');
        }
    });

    // Unfollow a user
    router.post('/:id/unfollow', authenticate, async (req, res) => {
        const { id } = req.params;
        try {
            // Ensure the followers table exists before using it
            await db.none('DELETE FROM followers WHERE follower_id = $1 AND followed_id = $2', [req.user.id, id]);
            res.send('Unfollowed');
        } catch (error) {
            console.error('Error unfollowing user:', error);
            res.status(500).send('Server error');
        }
    });

    // Get the list of users the current user is following
    router.get('/followed', authenticate, async (req, res) => {
        try {
            // Ensure the followers table exists before using it
            const followedUsers = await db.any('SELECT id, username FROM users WHERE id IN (SELECT followed_id FROM followers WHERE follower_id = $1)', [req.user.id]);
            res.json(followedUsers);
        } catch (error) {
            console.error('Error fetching followed users:', error);
            res.status(500).send('Server error');
        }
    });

    // Get current user's information
    router.get('/me', authenticate, async (req, res) => {
        try {
            const user = await db.oneOrNone('SELECT id, username FROM users WHERE id = $1', [req.user.id]);
            if (!user) return res.status(404).send('User not found');
            res.json(user);
        } catch (error) {
            console.error('Error fetching user:', error);
            res.status(500).send('Server error');
        }
    });

    return router;
};
