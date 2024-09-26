// routes/post.js
const express = require('express');
const router = express.Router();
const { createPost, getPosts, deletePost, likePost, dislikePost, commentPost, sharePost } = require('../controllers/postController');
const authenticate = require('../middlewares/authenticate');

router.post('/', authenticate, createPost);
router.get('/', authenticate, getPosts);
router.delete('/:id', authenticate, deletePost);
router.post('/:id/like', authenticate, likePost);
router.post('/:id/dislike', authenticate, dislikePost);
router.post('/:id/comment', authenticate, commentPost);
router.post('/:id/share', authenticate, sharePost);

module.exports = router;
