const beatController = require('../controllers/beat-controller');

const Router = require('express').Router;
const router = new Router();

router.post('/upload', beatController.upload);
router.get('/', beatController.getBeats);
router.get('/:id', beatController.getIndividualBeat);

module.exports = router;
