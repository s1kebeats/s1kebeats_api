import { Router, NextFunction, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import ApiError from '../exceptions/api-error.js';
import authMiddleware from '../middlewares/auth-middleware.js';
import beatService from '../services/beat-service.js';
import commentService from '../services/comment-service.js';
const router = Router();

router.get(
  '/:id',
  param('id').isDecimal().bail(),
  authMiddleware,
  body('viewed').if(body('viewed').exists()).isDecimal().bail(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // express validator errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(
          ApiError.BadRequest('Data validation error.', errors.array())
        );
      }
      const id = +req.params.id;
      // has error throw inside, if beat doesn't exist
      const beat = await beatService.getBeatById(id);
      const comments = await commentService.getComments(
        beat.id,
        req.body.viewed ? +req.body.viewed : 0
      );
      return res.json({
        comments,
        viewed: +req.body.viewed + comments.length,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
