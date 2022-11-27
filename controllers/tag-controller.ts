import PrismaClient from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import tagService from '../services/tag-service.js';

class TagController {
  async getTags(req: Request, res: Response, next: NextFunction) {
    try {
      let tags: PrismaClient.Tag[] | null;
      if (req.query.name) {
        tags = await tagService.findTags(
          req.query.name as string,
          req.body.viewed ? +req.body.viewed : 0
        );
      } else {
        tags = await tagService.getTags(req.body.viewed ? +req.body.viewed : 0);
      }
      return res.json({
        tags,
        viewed: +req.body.viewed + tags!.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new TagController();
