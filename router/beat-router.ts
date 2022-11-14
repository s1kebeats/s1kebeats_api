import beatController from '../controllers/beat-controller.js';
import authMiddleware from '../middlewares/auth-middleware.js';
import { body } from 'express-validator';
import { Router } from 'express';
const router = Router();

router.post(
  '/upload',
  // name required, 255 characters max
  body('name').notEmpty().isLength({ max: 255 }),
  // wavePrice required, numeric
  body('wavePrice').notEmpty().isDecimal(),
  // stemsPrice numeric
  body('stemsPrice').if(body('stemsPrice').exists()).isDecimal(),
  // bpm numeric
  body('bpm').if(body('bpm').exists()).isDecimal(),
  // description 255 characters max
  body('description').if(body('description').exists()).isLength({ max: 255 }),
  authMiddleware,
  beatController.upload
);
router.get('/', beatController.getBeats);
router.get('/:id', beatController.getIndividualBeat);

export default router;
