import ApiError from '../exceptions/api-error.js';
import beatService, { BeatUploadInput } from '../services/beat-service.js';
import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import UserDto from '../dtos/user-dto.js';
import PrismaClient from '@prisma/client';
import commentService from '../services/comment-service.js';
import likeService from '../services/like-service.js';
import { Beat } from '../prisma-selects/beat-select.js';
import { BeatIndividual } from '../prisma-selects/beat-individual-select.js';
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
                    query.tags = (req.query.tags as string)
                        .split(',')
                        .map((item) => +item);
                }
                beats = await beatService.findBeats(
                    query,
                    req.query.viewed ? +req.query.viewed : 0
                );
            } else {
                // get all beats
                beats = await beatService.getBeats(
                    req.query.viewed ? +req.query.viewed : 0
                );
            }
            return res.json({
                beats,
                viewed: req.query.viewed
                    ? +req.query.viewed + beats.length
                    : beats.length,
            });
        } catch (error) {
            next(error);
        }
    }

    // get individual beat data
    async getIndividualBeat(req: Request, res: Response, next: NextFunction) {
        try {
            const id = +req.params.id;
            const beat: BeatIndividual = await beatService.getIndividualBeat(
                id
            );
            return res.json(beat);
        } catch (error) {
            next(error);
        }
    }

    // beat upload
    async upload(req: Request, res: Response, next: NextFunction) {
        try {
            let tags: PrismaClient.Tag[];
            let connectOrCreateTags:
                | PrismaClient.Prisma.TagCreateOrConnectWithoutBeatsInput[]
                | undefined;
            if (req.body.tags) {
                tags = JSON.parse(req.body.tags);
                if (!Array.isArray(tags)) {
                    return next(ApiError.BadRequest('Wrong tags.'));
                }
                tags.forEach((tag: PrismaClient.Tag) => {
                    if (!tag.name) {
                        return next(ApiError.BadRequest('Wrong tags.'));
                    }
                });
                // prisma client ConnectOrCreate syntax
                connectOrCreateTags = tags.map((tag: PrismaClient.Tag) => {
                    return {
                        where: { name: tag.name },
                        create: { name: tag.name },
                    };
                });
            }
            const beatCandidate: BeatUploadInput = {
                ...req.body,
                wavePrice: +req.body.wavePrice,
                ...req.files,
                userId: req.user!.id,
            };
            if (connectOrCreateTags) {
                beatCandidate.tags = {
                    connectOrCreate: connectOrCreateTags,
                };
            }
            // convert strings to numbers
            if (beatCandidate.bpm) {
                beatCandidate.bpm = +beatCandidate.bpm;
            }
            if (beatCandidate.stemsPrice) {
                beatCandidate.stemsPrice = +beatCandidate.stemsPrice;
            }
            const beat = await beatService.uploadBeat(beatCandidate);
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
            const commentCandidate: PrismaClient.Prisma.CommentCreateManyInput =
                {
                    userId: req.user!.id,
                    beatId: beat.id,
                    content: req.body.content,
                };
            const comment = await commentService.uploadComment(
                commentCandidate
            );
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
            // Has built in 404 Throw
            const beatOriginal = await beatService.getBeatById(+req.params.id);
            if (req.user!.id !== beatOriginal.userId) {
                return next(ApiError.UnauthorizedUser());
            }
            let tags: PrismaClient.Tag[];
            let connectOrCreateTags:
                | PrismaClient.Prisma.TagCreateOrConnectWithoutBeatsInput[]
                | undefined;
            if (req.body.tags) {
                tags = JSON.parse(req.body.tags);
                if (!Array.isArray(tags)) {
                    return next(ApiError.BadRequest('Wrong tags.'));
                }
                tags.forEach((tag: PrismaClient.Tag) => {
                    if (!tag.name) {
                        return next(ApiError.BadRequest('Wrong tags.'));
                    }
                });
                // prisma client ConnectOrCreate syntax
                connectOrCreateTags = tags.map((tag: PrismaClient.Tag) => {
                    return {
                        where: { name: tag.name },
                        create: { name: tag.name },
                    };
                });
            }
            const dataToEdit: BeatUploadInput = {
                ...req.body,
                ...req.files,
            };
            if (connectOrCreateTags) {
                dataToEdit.tags = {
                    connectOrCreate: connectOrCreateTags,
                };
            }
            // convert strings to numbers
            if (dataToEdit.bpm) {
                dataToEdit.bpm = +dataToEdit.bpm;
            }
            if (dataToEdit.stemsPrice) {
                dataToEdit.stemsPrice = +dataToEdit.stemsPrice;
            }
            if (dataToEdit.wavePrice) {
                dataToEdit.wavePrice = +dataToEdit.wavePrice;
            }
            // beat data validation
            beatService.validateBeatEdit(dataToEdit);
            const beatEdited = await beatService.editBeat(
                beatOriginal,
                dataToEdit
            );
            return res.json(beatEdited);
        } catch (error) {
            next(error);
        }
    }
}

export default new BeatController();
