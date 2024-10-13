const express = require('express');
const router = express.Router();
const { 
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
    getUserPosts,
} = require('../controllers/postController');
const authenticate = require('../middlewares/authenticate');

router.post('/', authenticate, createPost);
router.get('/', authenticate, getPosts);
router.delete('/:id', authenticate, deletePost);
router.post('/:id/like', authenticate, likePost);
router.post('/:id/dislike', authenticate, dislikePost);
router.post('/:id/comment', authenticate, commentPost);
router.post('/:id/share', authenticate, sharePost);
router.post('/:postId/comments/:commentId/like', authenticate, likeComment); 
router.post('/:postId/comments/:commentId/dislike', authenticate, dislikeComment); 
router.post('/:postId/comments/:commentId/reply', authenticate, replyToComment);
router.get('/user/:userId', authenticate, getUserPosts); 


module.exports = router;
