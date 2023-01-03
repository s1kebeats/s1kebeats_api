import ApiError from "../exceptions/api-error";
import beatService from "../services/beat-service";
import { Request, Response, NextFunction } from "express";
import UserDto from "../dtos/user-dto";
import PrismaClient from "@prisma/client";
import commentService from "../services/comment-service";
import likeService from "../services/like-service";
import { Beat } from "../prisma-selects/beat-select";
import { BeatIndividual } from "../prisma-selects/beat-individual-select";
import mediaService from "../services/media-service";
// req.user
declare module "express-serve-static-core" {
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
        const query: { q?: string; bpm?: number; tags?: string[]; orderBy?: string } = (({
          q,
          bpm,
          tags,
          orderBy,
        }) => ({
          q,
          bpm: bpm ? +bpm : undefined,
          tags: tags ? tags.split(",") : undefined,
          orderBy,
        }))(req.query as { [key: string]: string });
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
        bpm: bpm ? +bpm : undefined,
        description,
        tags: tags
          ? {
              connectOrCreate: tags.split(",").map((tag: string) => {
                if (!tag.match(/^[0-9a-zA-Z]+$/)) {
                  throw ApiError.BadRequest("Wrong tags");
                }
                return {
                  where: { name: tag },
                  create: { name: tag },
                };
              }),
            }
          : undefined,

        stemsPrice: stemsPrice ? +stemsPrice : undefined,
        wavePrice: +wavePrice,

        wave,
        mp3,
        stems,
        image,

        user: {
          connect: { id: userId },
        },
      }))(req.body);
      const beat = await beatService.uploadBeat(payload);
      return res.json(beat);
    } catch (error) {
      next(error);
    }
  }

  async edit(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const original = await beatService.getBeatById(+req.params.id);
      if (userId !== original.userId) {
        return next(ApiError.UnauthorizedUser());
      }
      const payload: PrismaClient.Prisma.BeatUpdateInput = (({
        name,
        bpm,
        description,
        tags,

        wavePrice,
        stemsPrice,

        image,
        wave,
        mp3,
        stems,
      }) => ({
        name,
        bpm: +bpm,
        description,
        tags: tags
          ? {
              set: [],
              connectOrCreate: tags.split(",").map((tag: string) => {
                return {
                  where: { name: tag },
                  create: { name: tag },
                };
              }),
            }
          : undefined,

        wavePrice: +wavePrice,
        stemsPrice: +stemsPrice,

        image,
        wave,
        mp3,
        stems,
      }))(req.body);
      const merged = { ...original, ...payload };
      if ((merged.stemsPrice && !merged.stems) || (merged.stems && !merged.stemsPrice)) {
        return next(ApiError.BadRequest("Provide both stems and stems price"));
      }
      const mediaFileKeys = ["mp3", "wave", "stems", "image"] as const;
      for (const key of mediaFileKeys) {
        if (payload[key] && original[key]) {
          mediaService.deleteObject(original[key]!);
        }
      }
      const beat = await beatService.editBeat(original.id, payload);
      return res.json(beat);
    } catch (error) {
      next(error);
    }
  }

  async comment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const id = +req.params.id;
      // has error throw inside, if beat doesn't exist
      const beat = await beatService.getBeatById(id);
      const payload: PrismaClient.Prisma.CommentCreateInput = {
        user: {
          connect: { id: userId },
        },
        beat: {
          connect: { id: beat.id },
        },
        content: req.body.content,
      };
      const comment = await commentService.uploadComment(payload);
      return res.json(comment);
    } catch (error) {
      next(error);
    }
  }

  async likeToggle(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const id = +req.params.id;
      // Has built in 404 Throw
      const beat = await beatService.getBeatById(id);
      let like: PrismaClient.Like | null;
      like = await likeService.getLikeByIdentifier(beat.id, userId);
      if (like) {
        // delete the like from db
        like = await likeService.deleteLike(beat.id, userId);
      } else {
        // create like
        like = await likeService.createLike(beat.id, userId);
      }
      return res.json(like);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const id = +req.params.id;
      // Has built in 404 Throw
      const beat = await beatService.getBeatById(id);
      if (userId !== beat.userId) {
        return next(ApiError.UnauthorizedUser());
      }
      await beatService.deleteBeat(beat);
      return res.json("success");
    } catch (error) {
      next(error);
    }
  }
}

export default new BeatController();
