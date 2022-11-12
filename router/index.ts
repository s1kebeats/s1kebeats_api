import userRouter from './user-router';
import authorRouter from './author-router';
import beatRouter from './beat-router';
import fileRouter from './file-router';
import { Router } from 'express';

const router = Router();

router.use('/', userRouter);
router.use('/authors', authorRouter);
router.use('/beats', beatRouter);
router.use('/file', fileRouter);

export default router;
