import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import ApiError from '../exceptions/api-error.js';
import beatService from '../services/beat-service.js';
import commentService from '../services/comment-service.js';

class CommentController {
  async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      // express validator errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(
          ApiError.BadRequest('Data validation error.', errors.array())
        );
      }
      const commentId = +req.params.id;
      let comment = await commentService.getCommentById(commentId);
      if (!comment) {
        return next(ApiError.NotFound('Comment was not found.'));
      }
      if (commentId !== req.user!.id) {
        return next(ApiError.UnauthorizedUser());
      }
      comment = await commentService.deleteComment(commentId);
      return res.json(comment);
    } catch (error) {
      next(error);
    }
  }
  async getComments(req: Request, res: Response, next: NextFunction) {
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
        req.query.viewed ? +req.query.viewed : 0
      );
      return res.json({
        comments,
        viewed: req.query.viewed
          ? +req.query.viewed + comments.length
          : comments.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CommentController();
