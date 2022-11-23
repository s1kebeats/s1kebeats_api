import PrismaClient from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import tagService from '../services/tag-service';

class TagController {
    async getTags(req: Request, res: Response, next: NextFunction) {
        try {
            let tags: PrismaClient.Tag[];
            if (Object.keys(req.query).length) {
                tags = await tagService.findTags(req.query, req.body.viewed ? +req.body.viewed : 0);
            } else {
                tags = await tagService.getTags(req.body.viewed ? +req.body.viewed : 0);
            }
            return res.json(tags)
        } catch (error) {
            next(error);
        }
    }
}

export default new TagController();