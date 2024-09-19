const express = require('express');
const { signUp, signIn } = require('../controllers/authController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

router.post('/signup', signUp);
router.post('/signin', signIn);

module.exports = router;
