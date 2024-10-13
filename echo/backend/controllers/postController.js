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

const getUserPosts = async (req, res) => {
    
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }

    try {
        const posts = await db.any(`
            SELECT posts.id, posts.title, posts.body, posts.user_id, users.username,
                COALESCE(json_agg(comments_with_replies) FILTER (WHERE comments_with_replies.id IS NOT NULL), '[]') AS comments,
                (SELECT COUNT(*) FROM likes WHERE post_id = posts.id) AS like_count,
                (SELECT COUNT(*) FROM dislikes WHERE post_id = posts.id) AS dislike_count
            FROM posts
            JOIN users ON posts.user_id = users.id
            LEFT JOIN (
                SELECT comments.id, comments.post_id, comments.comment, comments.user_id,
                       users.username AS comment_username,
                       COALESCE(json_agg(comment_replies) FILTER (WHERE comment_replies.id IS NOT NULL), '[]') AS replies,
                       (SELECT COUNT(*) FROM comment_reactions WHERE comment_id = comments.id AND type = 'like') AS likes,
                       (SELECT COUNT(*) FROM comment_reactions WHERE comment_id = comments.id AND type = 'dislike') AS dislikes
                FROM comments
                JOIN users ON comments.user_id = users.id
                LEFT JOIN (
                    SELECT comment_replies.id, comment_replies.comment_id, comment_replies.reply, comment_replies.user_id,
                           users.username AS reply_username
                    FROM comment_replies
                    JOIN users ON comment_replies.user_id = users.id
                ) AS comment_replies ON comments.id = comment_replies.comment_id
                GROUP BY comments.id, users.username
            ) AS comments_with_replies ON posts.id = comments_with_replies.post_id
            WHERE posts.user_id = $1
            GROUP BY posts.id, users.username
            ORDER BY posts.created_at DESC
        `, [userId]);

        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error.message, error.stack);
        res.status(500).send('Server error');
    }
};


const getPosts = async (req, res) => {
    const userId = req.user.id;

    try {
        const posts = await db.any(`
            SELECT posts.id, posts.title, posts.body, posts.user_id, users.username,
                COALESCE(json_agg(comments_with_replies) FILTER (WHERE comments_with_replies.id IS NOT NULL), '[]') AS comments,
                (SELECT COUNT(*) FROM likes WHERE post_id = posts.id) AS like_count,
                (SELECT COUNT(*) FROM dislikes WHERE post_id = posts.id) AS dislike_count
            FROM posts
            JOIN users ON posts.user_id = users.id
            LEFT JOIN (
                SELECT comments.id, comments.post_id, comments.comment, comments.user_id,
                       users.username AS comment_username,
                       COALESCE(json_agg(comment_replies) FILTER (WHERE comment_replies.id IS NOT NULL), '[]') AS replies,
                       (SELECT COUNT(*) FROM comment_reactions WHERE comment_id = comments.id AND type = 'like') AS likes,
                       (SELECT COUNT(*) FROM comment_reactions WHERE comment_id = comments.id AND type = 'dislike') AS dislikes
                FROM comments
                JOIN users ON comments.user_id = users.id
                LEFT JOIN (
                    SELECT comment_replies.id, comment_replies.comment_id, comment_replies.reply, comment_replies.user_id,
                           users.username AS reply_username
                    FROM comment_replies
                    JOIN users ON comment_replies.user_id = users.id
                ) AS comment_replies ON comments.id = comment_replies.comment_id
                GROUP BY comments.id, users.username
            ) AS comments_with_replies ON posts.id = comments_with_replies.post_id
            WHERE posts.user_id = $1 OR posts.user_id IN (
                SELECT followed_id FROM followers WHERE follower_id = $1
            )
            GROUP BY posts.id, users.username
            ORDER BY posts.created_at DESC
        `, [userId]);

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
            
            await t.none('DELETE FROM likes WHERE post_id = $1', [id]);

            
            await t.none('DELETE FROM dislikes WHERE post_id = $1', [id]);

            
            await t.none('DELETE FROM comment_reactions WHERE comment_id IN (SELECT id FROM comments WHERE post_id = $1)', [id]);

            
            await t.none('DELETE FROM comment_replies WHERE comment_id IN (SELECT id FROM comments WHERE post_id = $1)', [id]);

            
            await t.none('DELETE FROM comments WHERE post_id = $1', [id]);

            
            await t.none('DELETE FROM posts WHERE id = $1', [id]);
        });

        res.status(200).json({ message: 'Post and related data deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error.message || error);
        res.status(500).json({ message: 'Server error', error: error.message || error });
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

const likeComment = async (req, res) => {
    const userId = req.user.id;
    const { commentId } = req.params; 

    try {
        await db.none(
            'INSERT INTO comment_reactions (user_id, comment_id, type) VALUES ($1, $2, $3) ON CONFLICT (user_id, comment_id, type) DO NOTHING', 
            [userId, commentId, 'like']
        );
        res.status(200).json({ message: 'Comment liked successfully' });
    } catch (error) {
        console.error('Error liking comment:', error.message, error.stack);
        res.status(500).send('Server error');
    }
};

const dislikeComment = async (req, res) => {
    const userId = req.user.id;
    const { commentId } = req.params; 

    try {
        await db.none(
            'INSERT INTO comment_reactions (user_id, comment_id, type) VALUES ($1, $2, $3) ON CONFLICT (user_id, comment_id, type) DO NOTHING', 
            [userId, commentId, 'dislike']
        );
        res.status(200).json({ message: 'Comment disliked successfully' });
    } catch (error) {
        console.error('Error disliking comment:', error.message, error.stack);
        res.status(500).send('Server error');
    }
};


const replyToComment = async (req, res) => {
    const userId = req.user.id;
    const { commentId } = req.params;
    const { reply } = req.body;

    try {
        const newReply = await db.one(
            'INSERT INTO comment_replies (user_id, comment_id, reply) VALUES ($1, $2, $3) RETURNING *',
            [userId, commentId, reply]
        );
        res.status(201).json(newReply);
    } catch (error) {
        console.error('Error replying to comment:', error.message, error.stack);
        res.status(500).send('Server error');
    }
};

const getPostReactions = async (postId) => {
    const reactions = await db.oneOrNone(`
        SELECT 
            (SELECT COUNT(*) FROM likes WHERE post_id = $1) AS like_count,
            (SELECT COUNT(*) FROM dislikes WHERE post_id = $1) AS dislike_count
        FROM posts
        WHERE id = $1
    `, [postId]);
    
    return reactions || { like_count: 0, dislike_count: 0 };
};

const getCommentReactions = async (commentId) => {
    const reactions = await db.oneOrNone(`
        SELECT 
            (SELECT COUNT(*) FROM comment_reactions WHERE comment_id = $1 AND type = 'like') AS like_count,
            (SELECT COUNT(*) FROM comment_reactions WHERE comment_id = $1 AND type = 'dislike') AS dislike_count
        FROM comments
        WHERE id = $1
    `, [commentId]);

    return reactions || { like_count: 0, dislike_count: 0 };
};



module.exports = {
    createPost,
    getPosts,
    deletePost,
    likePost,
    dislikePost,
    commentPost,
    sharePost,
    likeComment,
    dislikeComment,
    replyToComment,
    getPostReactions,
    getCommentReactions,
    getUserPosts,
};
