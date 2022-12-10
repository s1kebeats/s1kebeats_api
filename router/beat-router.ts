import beatController from '../controllers/beat-controller.js';
import authMiddleware from '../middlewares/auth-middleware.js';
import { body, param, query } from 'express-validator';
import { Router } from 'express';
const router = Router();

router.post(
  '/upload',
  authMiddleware,
  // name required, 255 characters max
  body('name').notEmpty().bail().isLength({ max: 255 }).bail(),
  // wavePrice required, numeric
  body('wavePrice').notEmpty().bail().isDecimal().bail(),
  // stemsPrice numeric
  body('stemsPrice').if(body('stemsPrice').exists()).isDecimal().bail(),
  // bpm numeric
  body('bpm').if(body('bpm').exists()).isDecimal().bail(),
  // description 255 characters max
  body('description')
    .if(body('description').exists())
    .isLength({ max: 255 })
    .bail(),
  beatController.upload
);
router.get(
  '/',
  query('viewed').if(query('viewed').exists()).isDecimal().bail(),
  beatController.getBeats
);
router.get(
  '/:id',
  param('id').isDecimal().bail(),
  beatController.getIndividualBeat
);
router.post(
  '/:id/comment',
  authMiddleware,
  param('id').isDecimal().bail(),
  body('content').notEmpty().isLength({ max: 255 }).bail(),
  beatController.comment
);
router.post(
  '/:id/like',
  authMiddleware,
  param('id').isDecimal().bail(),
  beatController.likeToggle
);
router.post(
  '/:id/delete',
  authMiddleware,
  param('id').isDecimal().bail(),
  beatController.delete
);
router.post(
  '/:id/edit',
  authMiddleware,
  param('id').isDecimal().bail(),
  // name required, 255 characters max
  body('name').if(body('name').exists()).isLength({ max: 255 }).bail(),
  // wavePrice required, numeric
  body('wavePrice').if(body('wavePrice').exists()).isDecimal().bail(),
  // stemsPrice numeric
  body('stemsPrice').if(body('stemsPrice').exists()).isDecimal().bail(),
  // bpm numeric
  body('bpm').if(body('bpm').exists()).isDecimal().bail(),
  // description 255 characters max
  body('description')
    .if(body('description').exists())
    .isLength({ max: 255 })
    .bail(),
  beatController.edit
);

export default router;
