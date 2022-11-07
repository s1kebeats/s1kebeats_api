const beatController = require('../controllers/beat-controller');
const fileUpload = require('../middlewares/file-upload-middleware');

const Router = require('express').Router;
const router = new Router();

router.post('/upload', fileUpload, beatController.upload);
router.get('/', beatController.getBeats);
router.get('/:id', beatController.getIndividualBeat);

module.exports = router;
