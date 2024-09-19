const express = require('express');
const { searchUsers, getUser, followUser, unfollowUser, getFollowedUsers, getCurrentUser } = require('../controllers/userController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

router.get('/search', authenticate, searchUsers);
router.get('/:id', authenticate, getUser);
router.post('/:id/follow', authenticate, followUser);
router.post('/:id/unfollow', authenticate, unfollowUser);
router.get('/followed', authenticate, getFollowedUsers);
router.get('/me', authenticate, getCurrentUser);

module.exports = router;
