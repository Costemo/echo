const db = require('../db'); // Import your db instance
require('dotenv').config();

const searchUsers = async (req, res) => {
    const query = req.query.q;
    try {
        const users = await db.any('SELECT id, username FROM users WHERE username ILIKE $1', [`%${query}%`]);
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error.message, error.stack);
        res.status(500).send('Server error');
    }
};

const getUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await db.oneOrNone('SELECT id, username FROM users WHERE id = $1', [id]);
        if (!user) return res.status(404).send('User not found');
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error.message, error.stack);
        res.status(500).send('Server error');
    }
};

const followUser = async (req, res) => {
    const { id } = req.params;
    try {
        await db.none('INSERT INTO followers (follower_id, followed_id) VALUES ($1, $2)', [req.user.id, id]);
        res.send('Followed');
    } catch (error) {
        console.error('Error following user:', error.message, error.stack);
        res.status(500).send('Server error');
    }
};

const unfollowUser = async (req, res) => {
    const { id } = req.params;
    try {
        await db.none('DELETE FROM followers WHERE follower_id = $1 AND followed_id = $2', [req.user.id, id]);
        res.send('Unfollowed');
    } catch (error) {
        console.error('Error unfollowing user:', error.message, error.stack);
        res.status(500).send('Server error');
    }
};

const getFollowedUsers = async (req, res) => {
    try {
        const followedUsers = await db.any('SELECT id, username FROM users WHERE id IN (SELECT followed_id FROM followers WHERE follower_id = $1)', [req.user.id]);
        res.json(followedUsers);
    } catch (error) {
        console.error('Error fetching followed users:', error.message, error.stack);
        res.status(500).send('Server error');
    }
};

const getCurrentUser = async (req, res) => {
    try {
        const user = await db.oneOrNone('SELECT id, username FROM users WHERE id = $1', [req.user.id]);
        if (!user) return res.status(404).send('User not found');
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error.message, error.stack);
        res.status(500).send('Server error');
    }
};

module.exports = {
    searchUsers,
    getUser,
    followUser,
    unfollowUser,
    getFollowedUsers,
    getCurrentUser
};
