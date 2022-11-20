import ApiError from '../exceptions/api-error.js';
import beatService, {
  BeatIndividual,
  BeatWithAuthorAndTags,
} from '../services/beat-service.js';
import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import UserDto from '../dtos/user-dto.js';
import PrismaClient from '@prisma/client';
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
      let beats: BeatWithAuthorAndTags[];
      if (req.query) {
        const query: { tags: number[] } = {
          ...req.query,
          tags: [],
        };
        // ids string to array of ids
        if (req.query.tags) {
          query.tags = (req.query.tags as string)
            .split(',')
            .map((item) => +item);
        }
        beats = await beatService.findBeats(query);
      } else {
        // get all beats
        beats = await beatService.getBeats();
      }
      return res.json(beats);
    } catch (error) {
      next(error);
    }
  }
  // get individual beat data
  async getIndividualBeat(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.params.id === 'upload') {
        // /api/beat/upload path
        return next(ApiError.NotFound('POST only'));
      }
      const id = +req.params.id;
      if (!id) {
        return next(ApiError.BadRequest('Wrong id.'));
      }
      const beat: BeatIndividual = await beatService.getBeatById(id);
      return res.json(beat);
    } catch (error) {
      next(error);
    }
  }
  // beat upload
  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      // express validator errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(
          ApiError.BadRequest('Data validation error.', errors.array())
        );
      }
      let tags;
      if (req.body.tags) {
        tags = JSON.parse(req.body.tags);
        if (!Array.isArray(tags)) {
          return next(ApiError.BadRequest('Wrong tags.'));
        }
        // prisma client ConnectOrCreate syntax
        tags = tags.map((tag: PrismaClient.Tag) => {
          if (!tag.name) {
            return next(ApiError.BadRequest('Wrong tags.'));
          }
          return {
            where: { name: tag.name },
            create: { name: tag.name },
          };
        });
      }
      const beatCandidate = {
        ...req.body,
        wavePrice: +req.body.wavePrice,
        ...req.files,
        userId: req.user!.id,
      };
      if (tags) {
        beatCandidate.tags = {
          connectOrCreate: tags,
        };
      }
      // convert strings to numbers
      if (beatCandidate.bpm) {
        beatCandidate.bpm = +beatCandidate.bpm;
      }
      if (beatCandidate.stemsPrice) {
        beatCandidate.stemsPrice = +beatCandidate.stemsPrice;
      }
      // beat data validation
      beatService.validateBeat(beatCandidate);
      const beat = await beatService.uploadBeat(beatCandidate);
      return res.json(beat);
    } catch (error) {
      next(error);
    }
  }
}

export default new BeatController();
