const userRouter = require('./user-router');
const authorRouter = require('./author-router');

const Router = require('express').Router;
const router = new Router();

router.use('/', userRouter);
router.use('/authors', authorRouter);

module.exports = router;
