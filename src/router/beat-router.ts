import beatController from '../controllers/beat-controller'
import authMiddleware from '../middlewares/auth-middleware'
import { body, param, query } from 'express-validator'
import { Router } from 'express'
import validationMiddleware from '../middlewares/validation-middleware'
const router = Router()

router.post(
  '/upload',
  authMiddleware,
  // name required, 255 characters max
  body('name').notEmpty().bail().isLength({ max: 255 }).bail(),
  // wavePrice required, numeric
  body('wavePrice').notEmpty().bail().isDecimal().bail(),
  body('wave').notEmpty().bail().contains('wave/').bail(),
  body('mp3').notEmpty().bail().contains('mp3/').bail(),
  // stemsPrice numeric
  body('stemsPrice').if(body('stemsPrice').exists()).isDecimal().bail(),
  body('stemsPrice').if(body('stems').exists()).notEmpty().bail(),
  body('stems').if(body('stems').exists()).contains('stems/').bail(),
  body('stems').if(body('stemsPrice').exists()).notEmpty().bail(),
  body('image').if(body('image').exists()).contains('image/').bail(),
  // bpm numeric
  body('bpm').if(body('bpm').exists()).isDecimal().bail(),
  // description 255 characters max
  body('description').if(body('description').exists()).isLength({ max: 255 }).bail(),
  validationMiddleware,
  beatController.upload
)

router.get(
  '/',
  query('viewed').if(query('viewed').exists()).isDecimal().bail(),
  validationMiddleware,
  beatController.getBeats
)

router.get('/:id', param('id').isDecimal().bail(), validationMiddleware, beatController.getIndividualBeat)

router.post(
  '/:id/comment',
  authMiddleware,
  param('id').isDecimal().bail(),
  body('content').notEmpty().isLength({ max: 255 }).bail(),
  validationMiddleware,
  beatController.comment
)

router.post(
  '/:id/like',
  authMiddleware,
  param('id').isDecimal().bail(),
  validationMiddleware,
  beatController.likeToggle
)

router.post('/:id/delete', authMiddleware, param('id').isDecimal().bail(), validationMiddleware, beatController.delete)

router.post(
  '/:id/edit',
  authMiddleware,
  param('id').isDecimal().bail(),
  body('name').if(body('name').exists()).isLength({ max: 255 }).bail(),
  body('wavePrice').if(body('wavePrice').exists()).isDecimal().bail(),
  body('wave').if(body('wave').exists()).contains('wave/').bail(),
  body('mp3').if(body('mp3').exists()).contains('mp3/').bail(),
  body('stemsPrice').if(body('stemsPrice').exists()).isDecimal().bail(),
  body('stems').if(body('stems').exists()).contains('stems/').bail(),
  body('image').if(body('image').exists()).contains('image/').bail(),
  // bpm numeric
  body('bpm').if(body('bpm').exists()).isDecimal().bail(),
  // description 255 characters max
  body('description').if(body('description').exists()).isLength({ max: 255 }).bail(),
  validationMiddleware,
  beatController.edit
)

export default router
