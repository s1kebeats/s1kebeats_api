import userController from '../controllers/user-controller.js';
import { body } from 'express-validator';
import { Router } from 'express';
import authMiddleware from '../middlewares/auth-middleware.js';
import activatedMiddleware from '../middlewares/activated-middleware.js';

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
router.post(
  '/edit',
  authMiddleware,
  activatedMiddleware,
  body('displayedName')
    .if(body('displayedName').exists())
    .isLength({ max: 255 })
    .bail(),
  body('about').if(body('about').exists()).isLength({ max: 255 }).bail(),
  body('youtube').if(body('youtube').exists()).isLength({ max: 255 }).bail(),
  body('vk').if(body('vk').exists()).isLength({ max: 255 }).bail(),
  body('instagram')
    .if(body('instagram').exists())
    .isLength({ max: 255 })
    .bail(),
  userController.edit
);
router.post('/logout', userController.logout);
router.get('/activate/:activationLink', userController.activate);
router.get('/refresh', userController.refresh);

export default router;
