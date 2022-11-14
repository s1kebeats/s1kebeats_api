import ApiError from '../exceptions/api-error.js';
import beatService, {
  BeatIndividual,
  BeatWithAuthorAndTags,
} from '../services/beat-service.js';
import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import UserDto from '../dtos/user-dto.js';
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
        beats = await beatService.findBeats(req.query);
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
      const beat: BeatIndividual = await beatService.getBeatById(
        +req.params.id
      );
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
        return next(ApiError.BadRequest('Ошибка валидации', errors.array()));
      }
      const beatCandidate = {
        ...req.body,
        tags: JSON.parse(req.body.tags),
        wavePrice: +req.body.wavePrice,
        ...req.files,
        userId: req.user!.id,
      };
      // convers strings to numbers
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
