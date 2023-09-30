import PrismaClient from '@prisma/client';

import ApiError from '../exceptions/api-error';
import beatIndividualSelect, {
  BeatIndividual,
} from '../prisma-selects/beat-individual-select';
import beatSelect, { Beat } from '../prisma-selects/beat-select';
import mediaService from './media-service';
const prisma = new PrismaClient.PrismaClient();

export interface BeatIndividualWithRelated extends BeatIndividual {
  related: Beat[];
}

class BeatService {
  // get all beats
  async getBeats(viewed = 0): Promise<Beat[]> {
    const beats = await prisma.beat.findMany({
      ...beatSelect,
      skip: viewed,
      take: 10,
    });
    return beats;
  }

  formatBeatOrderBy(
    orderBy: string
  ): PrismaClient.Prisma.BeatAvgOrderByAggregateInput {
    if (orderBy.includes('Lower')) {
      return {
        [orderBy.slice(0, -5)]: 'asc',
      };
    }
    if (orderBy.includes('Higher')) {
      return {
        [orderBy.slice(0, -6)]: 'desc',
      };
    }
    return {
      id: 'desc',
    };
  }

  // find beats with query
  async findBeats(
    {
      q,
      bpm,
      tags,
      orderBy,
    }: { q?: string; bpm?: number; tags?: string[]; orderBy?: string },
    viewed = 0
  ): Promise<Beat[]> {
    let nameQuery: PrismaClient.Prisma.BeatWhereInput = {};
    if (q) {
      nameQuery = {
        OR: [
          {
            name: {
              contains: q,
              mode: 'insensitive',
            },
          },
          {
            user: {
              OR: [
                {
                  username: {
                    contains: q,
                    mode: 'insensitive',
                  },
                },
                {
                  displayedName: {
                    contains: q,
                    mode: 'insensitive',
                  },
                },
              ],
            },
          },
        ],
      };
    }
    const queryArgs: PrismaClient.Prisma.BeatFindManyArgs = {
      take: 10,
      skip: viewed,
      orderBy: orderBy
        ? this.formatBeatOrderBy(orderBy)
        : {
            id: 'desc',
          },
      where: {
        ...nameQuery,
        bpm: {
          equals: bpm,
        },
        tags:
          tags != null
            ? {
                some: {
                  name: {
                    in: tags,
                    mode: 'insensitive',
                  },
                },
              }
            : undefined,
      },
    };
    const beats = await prisma.beat.findMany({ ...queryArgs, ...beatSelect });
    return beats;
  }

  async getIndividualBeat(
    id: number,
    authorized: boolean
  ): Promise<BeatIndividualWithRelated> {
    const beatFindUniqueArgs = {
      where: {
        id,
      },
      ...beatIndividualSelect(authorized),
    };
    const beat = await prisma.beat.findUnique(beatFindUniqueArgs);
    if (beat == null) {
      throw ApiError.NotFound('Beat was not found.');
    }
    // related beats (beats with same tags or author)
    const relatedBeats = await this.findBeats({
      tags: beat.tags.map((item: PrismaClient.Tag) => item.name),
      q: beat.user.username,
    });
    return {
      ...beat,
      related: relatedBeats.filter((item) => item.id !== beat.id),
    };
  }

  async getBeatById(id: number): Promise<PrismaClient.Beat> {
    const beat = await prisma.beat.findUnique({
      where: {
        id,
      },
    });
    if (beat == null) {
      throw ApiError.NotFound('Beat was not found.');
    }
    return beat;
  }

  async deleteBeatMedia(beat: PrismaClient.Beat) {
    const fileData: any = [null, null, null, null];
    fileData[0] = mediaService.deleteMedia(beat.wave);
    fileData[1] = mediaService.deleteMedia(beat.mp3);
    if (beat.image) {
      fileData[2] = mediaService.deleteMedia(beat.image);
    }
    if (beat.stems) {
      fileData[3] = mediaService.deleteMedia(beat.stems);
    }
    // async files deletion
    return await Promise.all(fileData);
  }

  async uploadBeat(
    data: PrismaClient.Prisma.BeatCreateInput
  ): Promise<BeatIndividual> {
    const beat = await prisma.beat.create({
      data,
      ...beatIndividualSelect(false),
    });
    return beat;
  }

  async editBeat(
    beatId: number,
    data: PrismaClient.Prisma.BeatUpdateInput
  ): Promise<BeatIndividual> {
    const beat = await prisma.beat.update({
      where: {
        id: beatId,
      },
      data,
      ...beatIndividualSelect(false),
    });
    return beat;
  }

  async deleteBeat(beat: PrismaClient.Beat) {
    // delete media files
    await this.deleteBeatMedia(beat);
    // delete beat from db
    await prisma.beat.delete({
      where: {
        id: beat.id,
      },
    });
  }
}

export default new BeatService();
