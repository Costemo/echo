const db = require('../db');
require('dotenv').config();
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        cb(null, `${req.params.id}-${Date.now()}${path.extname(file.originalname)}`); 
    }
});

const upload = multer({ storage });

const uploadProfilePicture = async (req, res) => {
    const { id } = req.params;
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }
    
    const profilePictureUrl = `http://localhost:5000/uploads/${req.file.filename}`; 

    try {
        await db.none('UPDATE users SET profile_picture = $1 WHERE id = $2', [profilePictureUrl, id]);
        res.json({ message: 'Profile picture updated', profilePictureUrl });
    } catch (error) {
        console.error('Error updating profile picture:', error.message, error.stack);
        res.status(500).send('Server error');
    }
};

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
        const user = await db.oneOrNone('SELECT id, username, profile_picture FROM users WHERE id = $1', [id]);
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

const addFriend = async (req, res) => {
    const { id } = req.params;
    try {
        await db.none('INSERT INTO friends (user_id, friend_id) VALUES ($1, $2)', [req.user.id, id]);
        res.send('Friend added');
    } catch (error) {
        console.error('Error adding friend:', error.message, error.stack);
        res.status(500).send('Server error');
    }
};

const removeFriend = async (req, res) => {
    const { id } = req.params;
    try {
        await db.none('DELETE FROM friends WHERE user_id = $1 AND friend_id = $2', [req.user.id, id]);
        res.send('Friend removed');
    } catch (error) {
        console.error('Error removing friend:', error.message, error.stack);
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

const getFriends = async (req, res) => {
    try {
        const friends = await db.any('SELECT id, username FROM users WHERE id IN (SELECT friend_id FROM friends WHERE user_id = $1)', [req.user.id]);
        res.json(friends);
    } catch (error) {
        console.error('Error fetching friends:', error.message, error.stack);
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

const isFollowed = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.oneOrNone('SELECT 1 FROM followers WHERE follower_id = $1 AND followed_id = $2', [req.user.id, id]);
        res.json(!!result);
    } catch (error) {
        console.error('Error checking follow status:', error.message, error.stack);
        res.status(500).send('Server error');
    }
};

const isFriend = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.oneOrNone('SELECT 1 FROM friends WHERE user_id = $1 AND friend_id = $2', [req.user.id, id]);
        res.json(!!result);
    } catch (error) {
        console.error('Error checking friend status:', error.message, error.stack);
        res.status(500).send('Server error');
    }
};

const createPost = async (req, res) => {
    const { title, body, userId } = req.body;
    try {
        const newPost = await db.one(
            'INSERT INTO posts (title, body, user_id) VALUES ($1, $2, $3) RETURNING id, title, body, user_id AS "userId"',
            [title, body, userId]
        );
        const user = await db.one('SELECT username FROM users WHERE id = $1', [userId]);
        res.status(201).json({ ...newPost, username: user.username });
    } catch (error) {
        console.error('Error creating post:', error.message, error.stack);
        res.status(500).send('Server error');
    }
};

module.exports = {
    searchUsers,
    getUser,
    followUser,
    unfollowUser,
    getFollowedUsers,
    getCurrentUser,
    addFriend,
    removeFriend,
    getFriends,
    isFollowed,
    isFriend,
    createPost,
    uploadProfilePicture,
};
