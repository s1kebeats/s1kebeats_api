import { NextFunction, Request, Response } from "express";
import ApiError from "../exceptions/api-error";
import beatService from "../services/beat-service";
import commentService from "../services/comment-service";

class CommentController {
  async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const id = +req.params.id;
      const comment = await commentService.getCommentById(id);
      if (comment == null) {
        next(ApiError.NotFound("Comment was not found."));
        return;
      }
      if (comment.userId !== userId) {
        next(ApiError.UnauthorizedUser());
        return;
      }
      await commentService.deleteComment(comment.id);
      return res.json("success");
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
