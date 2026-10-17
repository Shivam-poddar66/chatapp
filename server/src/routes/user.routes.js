const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/contacts', UserController.getContacts);
router.get('/search', UserController.search);
router.get('/:id', UserController.getProfile);

module.exports = router;
