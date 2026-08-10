const express = require('express');
const { loginValidator } = require('../validators/auth.validator');
const { validate } = require('../middleware/validate');
const { login, me } = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/login', loginValidator, validate, login);
router.get('/me', requireAuth, me);

module.exports = router;
