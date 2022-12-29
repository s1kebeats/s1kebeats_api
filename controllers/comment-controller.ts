import { NextFunction, Request, Response } from "express";
import ApiError from "../exceptions/api-error.js";
import beatService from "../services/beat-service.js";
import commentService from "../services/comment-service.js";

class CommentController {
  async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const id = +req.params.id;
      const comment = await commentService.getCommentById(id);
      if (!comment) {
        return next(ApiError.NotFound("Comment was not found."));
      }
      if (comment.userId !== userId) {
        return next(ApiError.UnauthorizedUser());
      }
      await commentService.deleteComment(comment.id);
      return res.json('success');
    } catch (error) {
      next(error);
    }
  }
  async getComments(req: Request, res: Response, next: NextFunction) {
    try {
      const id = +req.params.id;
      // has error throw inside, if beat doesn't exist
      const beat = await beatService.getBeatById(id);
      const comments = await commentService.getComments(beat.id, req.query.viewed ? +req.query.viewed : 0);
      return res.json({
        comments,
        viewed: req.query.viewed ? +req.query.viewed + comments.length : comments.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CommentController();
