import { Router } from 'express';
import { body } from 'express-validator';
import authMiddleware from '../middlewares/auth-middleware';
import mediaController from '../controllers/media-controller';
import validationMiddleware from '../middlewares/validation-middleware';
const router = Router();

router.post(
  '/upload',
  authMiddleware,
  body('path').notEmpty().bail(),
  validationMiddleware,
  mediaController.upload
);
router.get('/:path/:file', mediaController.get);

export default router;
