import userController from '../controllers/user-controller.js';
import { body } from 'express-validator';
import { Router } from 'express';

const router = Router();

router.post(
  '/register',
  // data validators
  body('email').isEmail().bail(),
  body('username')
    .notEmpty()
    .bail()
    .matches(/^[0-9a-zA-Z]+$/)
    .bail(),
  body('password').isLength({ min: 8, max: 32 }).bail(),
  userController.register
);
router.post(
  '/login',
  body('login').notEmpty().bail(),
  body('password').isLength({ min: 8, max: 32 }).bail(),
  userController.login
);
router.post('/logout', userController.logout);
router.get('/activate/:activationLink', userController.activate);
router.get('/refresh', userController.refresh);

export default router;
