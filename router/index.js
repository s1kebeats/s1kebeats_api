const userRouter = require('./user-router');
const authorRouter = require('./author-router');
const beatRouter = require('./beat-router');
const fileRouter = require('./file-router');

const Router = require('express').Router;
const router = new Router();

router.use('/', userRouter);
router.use('/authors', authorRouter);
router.use('/beats', beatRouter);
router.use('/file', fileRouter);

module.exports = router;
