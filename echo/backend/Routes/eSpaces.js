const express = require('express');
const { addESpace, getESpaces, getESpaceById, updateESpace, deleteESpace } = require('../controllers/eSpaceController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

router.post('/add', authenticate, addESpace);
router.get('/', authenticate, getESpaces);
router.get('/:id', authenticate, getESpaceById);
router.put('/:id', authenticate, updateESpace);
router.delete('/:id', authenticate, deleteESpace);

module.exports = router;
