import ApiError from '../exceptions/api-error.js';
import beatService, { BeatUploadInput } from '../services/beat-service.js';
import { Request, Response, NextFunction } from 'express';
import UserDto from '../dtos/user-dto.js';
import PrismaClient from '@prisma/client';
import commentService from '../services/comment-service.js';
import likeService from '../services/like-service.js';
import { Beat } from '../prisma-selects/beat-select.js';
import { BeatIndividual } from '../prisma-selects/beat-individual-select.js';
import mediaService from '../services/media-service.js';
// req.user
declare module 'express-serve-static-core' {
  interface Request {
    user?: UserDto;
  }
}

class BeatController {
  // find many beats
  async getBeats(req: Request, res: Response, next: NextFunction) {
    try {
      let beats: Beat[];
      if (Object.keys(req.query).length) {
        const query: { [key: string]: string | number[] } = {
          ...(req.query as { [key: string]: string }),
        };
        // ids string to array of ids
        if (req.query.tags) {
          query.tags = (req.query.tags as string).split(',').map((item) => +item);
        }
        beats = await beatService.findBeats(query, req.query.viewed ? +req.query.viewed : 0);
      } else {
        // get all beats
        beats = await beatService.getBeats(req.query.viewed ? +req.query.viewed : 0);
      }
      return res.json({
        beats,
        viewed: req.query.viewed ? +req.query.viewed + beats.length : beats.length,
      });
    } catch (error) {
      next(error);
    }
  }

  // get individual beat data
  async getIndividualBeat(req: Request, res: Response, next: NextFunction) {
    try {
      const id = +req.params.id;
      const beat: BeatIndividual = await beatService.getIndividualBeat(id);
      return res.json(beat);
    } catch (error) {
      next(error);
    }
  }

  // beat upload
  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const payload: PrismaClient.Prisma.BeatCreateInput = (({
        name,
        bpm,
        description,
        tags,

        stemsPrice,
        wavePrice,
        
        wave,
        mp3,
        stems,
        image,
      }: {
        [key: string]: string;
      }) => ({
        name,
        bpm: +bpm,
        description,
        tags: {
          connectOrCreate: tags.split(',').map((tag: string) => {
            return {
              where: { name: tag },
              create: { name: tag },
            };
          })
        },

        stemsPrice: +stemsPrice,
        wavePrice: +wavePrice,
        
        wave,
        mp3,
        stems,
        image,

        user: {
          connect: {  id: userId }
        },
      }))(req.body);
      const beat = await beatService.uploadBeat(payload);
      return res.json(beat);
    } catch (error) {
      next(error);
    }
  }

  async comment(req: Request, res: Response, next: NextFunction) {
    try {
      const id = +req.params.id;
      // has error throw inside, if beat doesn't exist
      const beat = await beatService.getBeatById(id);
      const commentCandidate: PrismaClient.Prisma.CommentCreateManyInput = {
        userId: req.user!.id,
        beatId: beat.id,
        content: req.body.content,
      };
      const comment = await commentService.uploadComment(commentCandidate);
      return res.json(comment);
    } catch (error) {
      next(error);
    }
  }

  async likeToggle(req: Request, res: Response, next: NextFunction) {
    try {
      // Has built in 404 Throw
      const beat = await beatService.getBeatById(+req.params.id);
      const beatId = beat.id;
      const userId = req.user!.id;
      let like: PrismaClient.Like | null;
      like = await likeService.getLikeByIdentifier(beatId, userId);
      if (like) {
        // delete the like from db
        like = await likeService.deleteLike(beatId, userId);
      } else {
        // create like
        like = await likeService.createLike(beatId, userId);
      }
      return res.json(like);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      // Has built in 404 Throw
      const beat = await beatService.getBeatById(+req.params.id);
      if (req.user!.id !== beat.userId) {
        return next(ApiError.UnauthorizedUser());
      }
      await beatService.deleteBeat(beat);
      return res.json('success');
    } catch (error) {
      next(error);
    }
  }

  async edit(req: Request, res: Response, next: NextFunction) {
    try {
      const original = await beatService.getBeatById(+req.params.id);
      if (req.user!.id !== original.userId) {
        return next(ApiError.UnauthorizedUser());
      }
      const payload: { [key: string]: string } = (({ mp3, wave, stems, image, name, tags }) => ({
        mp3,
        wave,
        stems,
        image,
        name,
        tags,
      }))(req.body);
      for (const key of Object.keys(payload)) {
        if ((key === 'mp3' || key === 'wave' || key === 'stems' || key === 'image') && original[key]) {
          mediaService.deleteObject(original[key]!);
        }
      }
      const data: PrismaClient.Prisma.BeatUpdateInput = (({ tags, bpm, stemsPrice, wavePrice, ...rest }) => ({
        bpm: +bpm,
        stemsPrice: +stemsPrice,
        wavePrice: +wavePrice,
        ...rest,
      }))(payload);
      if (payload.tags) {
        data.tags = {
          connectOrCreate: beatService.parseTagsString(payload.tags),
        };
      }
      await beatService.editBeat(original.id, data);
      return res.json('success');
    } catch (error) {
      next(error);
    }
  }
}

export default new BeatController();
