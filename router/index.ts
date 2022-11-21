import userRouter from './user-router.js';
import authorRouter from './author-router.js';
import beatRouter from './beat-router.js';
import fileRouter from './file-router.js';
import { Router } from 'express';
import commentRouter from './comment-router.js';

const router = Router();

router.use('/', userRouter);
router.use('/author', authorRouter);
router.use('/beat', beatRouter);
router.use('/file', fileRouter);
router.use('/comment', commentRouter);

export default router;
