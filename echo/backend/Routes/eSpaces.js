const express = require('express');
const {
    addESpace,
    getESpaces,
    getESpaceById,
    updateESpace,
    deleteESpace,
    searchESpaces,
    createESpacePost,
    getESpacePosts
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

module.exports = router;
