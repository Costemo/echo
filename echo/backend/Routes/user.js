const express = require('express');
const { 
    searchUsers, 
    getUser, 
    followUser, 
    unfollowUser, 
    addFriend, 
    removeFriend, 
    getFollowedUsers, 
    getFriends, 
    getCurrentUser, 
    isFollowed, 
    isFriend,
    createPost
} = require('../controllers/userController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

router.get('/search', authenticate, searchUsers);
router.get('/:id', authenticate, getUser);
router.post('/:id/follow', authenticate, followUser);
router.post('/:id/unfollow', authenticate, unfollowUser);
router.post('/:id/addFriend', authenticate, addFriend);
router.post('/:id/removeFriend', authenticate, removeFriend);
router.get('/followed', authenticate, getFollowedUsers);
router.get('/friends', authenticate, getFriends);
router.get('/me', authenticate, getCurrentUser);
router.get('/:id/isFollowed', authenticate, isFollowed);
router.get('/:id/isFriend', authenticate, isFriend);
router.post('/posts', authenticate, createPost);

module.exports = router;
