import { Router } from 'express';
import { query, param } from 'express-validator';
import commentController from '../controllers/comment-controller.js';
import authMiddleware from '../middlewares/auth-middleware.js';
const router = Router();

router.get(
    '/:id',
    param('id').isDecimal().bail(),
    authMiddleware,
    query('viewed').if(query('viewed').exists()).isDecimal().bail(),
    commentController.getComments
);
router.post(
    '/delete/:id',
    param('id').isDecimal().bail(),
    commentController.deleteComment
);

export default router;
