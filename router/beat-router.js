const beatController = require('../controllers/beat-controller');
const authMiddleware = require('../middlewares/auth-middleware');
const { body } = require('express-validator');

const Router = require('express').Router;
const router = new Router();

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

module.exports = router;
