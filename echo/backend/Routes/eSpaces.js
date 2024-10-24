const express = require('express');
const {
    addESpace,
    getESpaces,
    getESpaceById,
    updateESpace,
    deleteESpace,
    searchESpaces,
    createESpacePost,
    getESpacePosts,
    likeESpacePost,
    dislikeESpacePost,
    commentESpacePost,
    replyToESpaceComment,
} = require('../controllers/eSpaceController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

router.get('/search', authenticate, searchESpaces);

router.post('/add', authenticate, addESpace);
router.get('/', authenticate, getESpaces);
router.get('/:id', authenticate, getESpaceById);
router.put('/:id', authenticate, updateESpace);
router.delete('/:id', authenticate, deleteESpace);

// New routes for eSpace posts
router.post('/:spaceId/posts', authenticate, createESpacePost);
router.get('/:spaceId/posts', authenticate, getESpacePosts);

router.post('/:spaceId/posts/:postId/like', authenticate, likeESpacePost);
router.post('/:spaceId/posts/:postId/dislike', authenticate, dislikeESpacePost);
router.post('/:spaceId/posts/:postId/comment', authenticate, commentESpacePost);
router.post('/:spaceId/posts/:postId/comments/:commentId/reply', authenticate, replyToESpaceComment);

module.exports = router;
