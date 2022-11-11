const beatController = require('../controllers/beat-controller');
const authMiddleware = require('../middlewares/auth-middleware');
const { body } = require('express-validator');
const path = require('path');
const ApiError = require('../exceptions/api-error');

const Router = require('express').Router;
const router = new Router();

router.post(
  '/upload',
  // // making possible to validate files with express-validator
  // (req, res, next) => {
  //   // ТАЙМИНГИ?
  //   req.body.files = req.files;
  //   next();
  // },
  // // image file validation with extension and filesize
  // body('files.image')
  //   .if(body('files.image').exists())
  //   .custom((image) => {
  //     const ext = path.extname(image.name);
  //     if (!(ext === '.png' || ext === '.jpg' || ext === '.jpeg')) {
  //       throw ApiError.BadRequest(
  //         'Отправьте изображение в формате png или jpeg'
  //       );
  //     }
  //     return true;
  //   }),
  // // wave file validation with extension and filesize
  // body('files.wave')
  //   .exists()
  //   .custom((wave) => {
  //     const ext = path.extname(wave.name);
  //     if (ext !== '.wav') {
  //       throw ApiError.BadRequest('Отправьте аудио в формате wav')
  //     }
  //     // if (wave.size > 30 * 1024 * 1024) {
  //     //   throw ApiError.BadRequest('Максимальный размер файла 300мб');
  //     // }
  //     return true;
  //   }),
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
