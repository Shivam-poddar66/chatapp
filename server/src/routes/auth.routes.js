const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { validateBody } = require('../middlewares/validate');

router.post('/register', validateBody(['name', 'email', 'password']), AuthController.register);
router.post('/login', validateBody(['email', 'password']), AuthController.login);
router.get('/me', authMiddleware, AuthController.getMe);

module.exports = router;
