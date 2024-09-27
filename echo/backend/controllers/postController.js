const db = require('../db');
require('dotenv').config();

const createPost = async (req, res) => {
    const { title, body } = req.body;
    const userId = req.user.id;

    if (!title && !body) {
        return res.status(400).json({ message: 'Post must have a title or body' });
    }

    try {
        const newPost = await db.one(
            'INSERT INTO posts (user_id, title, body) VALUES ($1, $2, $3) RETURNING *',
            [userId, title, body]
        );
        res.status(201).json({ ...newPost, userId });
    } catch (error) {
        console.error('Error creating post:', error.message, error.stack);
        res.status(500).send('Server error');
    }
};

const getPosts = async (req, res) => {
    const userId = req.user.id;

    try {
        const posts = await db.any(
            `SELECT posts.id, posts.title, posts.body, posts.user_id, users.username,
                    COALESCE(json_agg(comments) FILTER (WHERE comments.id IS NOT NULL), '[]') AS comments
             FROM posts
             JOIN users ON posts.user_id = users.id
             LEFT JOIN comments ON posts.id = comments.post_id
             WHERE posts.user_id = $1 OR posts.user_id IN (
                 SELECT followed_id FROM followers WHERE follower_id = $1
             )
             GROUP BY posts.id, users.username
             ORDER BY posts.created_at DESC`,
            [userId]
        );
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error.message, error.stack);
        res.status(500).send('Server error');
    }
};


const deletePost = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const post = await db.oneOrNone('SELECT * FROM posts WHERE id = $1', [id]);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.user_id !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        await db.tx(async t => {
            await t.none('DELETE FROM comments WHERE post_id = $1', [id]);
            await t.none('DELETE FROM likes WHERE post_id = $1', [id]);
            await t.none('DELETE FROM dislikes WHERE post_id = $1', [id]);
            await t.none('DELETE FROM shares WHERE post_id = $1', [id]);
            await t.none('DELETE FROM posts WHERE id = $1', [id]);
        });

        res.status(200).json({ message: 'Post and related data deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error.message, error.stack);
        res.status(500).send('Server error');
    }
};


const likePost = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    try {
        await db.none('INSERT INTO likes (user_id, post_id) VALUES ($1, $2)', [userId, id]);
        res.status(200).json({ message: 'Post liked successfully' });
    } catch (error) {
        console.error('Error liking post:', error.message, error.stack);
        res.status(500).send('Server error');
    }
};

const dislikePost = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    try {
        await db.none('INSERT INTO dislikes (user_id, post_id) VALUES ($1, $2)', [userId, id]);
        res.status(200).json({ message: 'Post disliked successfully' });
    } catch (error) {
        console.error('Error disliking post:', error.message, error.stack);
        res.status(500).send('Server error');
    }
};

const commentPost = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { comment } = req.body;

    try {
        const newComment = await db.one(
            'INSERT INTO comments (user_id, post_id, comment) VALUES ($1, $2, $3) RETURNING *',
            [userId, id, comment]
        );
        res.status(201).json(newComment);
    } catch (error) {
        console.error('Error commenting on post:', error.message, error.stack);
        res.status(500).send('Server error');
    }
};

const sharePost = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    try {
        const originalPost = await db.one(
            `SELECT posts.*, users.username 
             FROM posts 
             JOIN users ON posts.user_id = users.id 
             WHERE posts.id = $1`, 
            [id]
        );

        
        const sharedPost = await db.one(
            'INSERT INTO posts (user_id, title, body) VALUES ($1, $2, $3) RETURNING *',
            [userId, originalPost.title, originalPost.body]
        );

        
        res.status(201).json({ 
            ...sharedPost, 
            originalUser: originalPost.username, 
            sharedBy: req.user.username 
        });
    } catch (error) {
        console.error('Error sharing post:', error.message, error.stack);
        res.status(500).send('Server error');
    }
};


module.exports = {
    createPost,
    getPosts,
    deletePost,
    likePost,
    dislikePost,
    commentPost,
    sharePost,
};
