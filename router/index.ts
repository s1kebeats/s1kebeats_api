import userRouter from './user-router.js';
import authorRouter from './author-router.js';
import beatRouter from './beat-router.js';
import fileRouter from './file-router.js';
import { Router } from 'express';

const router = Router();

router.use('/', userRouter);
router.use('/authors', authorRouter);
router.use('/beats', beatRouter);
router.use('/file', fileRouter);

export default router;
