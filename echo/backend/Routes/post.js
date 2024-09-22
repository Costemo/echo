const express = require('express');
const router = express.Router();
const { createPost, getPosts, deletePost } = require('../controllers/postController');
const authenticate = require('../middlewares/authenticate');

router.post('/', authenticate, createPost);
router.get('/', authenticate, getPosts);
router.delete('/:id', authenticate, deletePost);

module.exports = router;
