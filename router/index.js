const userController = require('../controllers/user-controller');
const { body } = require('express-validator');

const Router = require('express').Router;
const router = new Router;

router.post('/register',
    body('email').isEmail(),
    body('password').isLength({ min: 8, max: 32 }),
    userController.register);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.get('/activate/:activationLink', userController.activate);
router.get('/refresh', userController.refresh);
router.get('/users', userController.getUsers);

module.exports = router;