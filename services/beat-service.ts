import PrismaClient from '@prisma/client';
const prisma = new PrismaClient.PrismaClient();
import aws from 'aws-sdk';
import { UploadedFile } from 'express-fileupload';
import ApiError from '../exceptions/api-error.js';
import beatIndividualSelect, {
  BeatIndividual,
} from '../prisma-selects/beat-individual-select.js';
import beatSelect, { Beat } from '../prisma-selects/beat-select.js';
import fileService from './file-service.js';

export interface BeatIndividualWithRelated extends BeatIndividual {
  related: Beat[];
}
export interface BeatUploadInput
  extends Omit<PrismaClient.Beat, 'image' | 'wave' | 'mp3' | 'stems'> {
  [x: string]: any;
  beatCandidate: any;
  tags: {
    connectOrCreate: PrismaClient.Prisma.TagCreateOrConnectWithoutBeatsInput[];
  };
  image: UploadedFile;
  wave: UploadedFile;
  mp3: UploadedFile;
  stems: UploadedFile;
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
  // find beats with query
  async findBeats(
    {
      tags = [],
      q,
      bpm,
      order,
    }: { q?: string; bpm?: string; order?: string; tags?: number[] },
    viewed = 0
  ): Promise<Beat[]> {
    const where: PrismaClient.Prisma.BeatWhereInput = {};
    const orderBy: PrismaClient.Prisma.BeatOrderByWithRelationInput = {
      id: 'asc',
    };
    const queryArgs = {
      orderBy: orderBy,
      skip: viewed,
      take: 10,
      where: where,
      ...beatSelect,
    };

    if (order) {
      if (order[0] !== 'H' && order[0] !== 'L') {
        throw ApiError.BadRequest('Wrong order.');
      }
      queryArgs.orderBy = {
        [order.slice(1)]: order[0] === 'H' ? 'desc' : 'asc',
      };
    }
    // query in beat name / author name
    if (q) {
      queryArgs.where = {
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
    if (tags.length) {
      queryArgs.where.tags = {
        some: {
          id: {
            in: tags,
          },
        },
      };
    }
    if (bpm) {
      queryArgs.where.bpm = {
        equals: +bpm,
      };
    }

    const beats = await prisma.beat.findMany(queryArgs);
    return beats;
  }
  async getIndividualBeat(id: number): Promise<BeatIndividualWithRelated> {
    const beatFindUniqueArgs = {
      where: {
        id,
      },
      ...beatIndividualSelect,
    };
    const beat = await prisma.beat.findUnique(beatFindUniqueArgs);
    if (!beat) {
      throw ApiError.NotFound(`Beat was not found.`);
    }
    // related beats (beats with same tags or author)
    const relatedBeats = await this.findBeats({
      tags: beat.tags.map((item: PrismaClient.Tag) => item.id),
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
    if (!beat) {
      throw ApiError.NotFound(`Beat was not found.`);
    }
    return beat;
  }
  validateBeat(beat: BeatUploadInput) {
    // required beat data check
    if (!beat.wave || !beat.mp3) {
      throw ApiError.BadRequest('Not enough data.');
    }
    // files validation
    // wave check
    fileService.validateFile(
      beat.wave,
      '.wav',
      // 300mb
      300 * 1024 * 1024
    );

    // mp3 check
    fileService.validateFile(
      beat.mp3,
      '.mp3',
      // 150mb
      150 * 1024 * 1024
    );

    // image check
    if (beat.image) {
      fileService.validateFile(beat.image, ['.png', '.jpg', '.jpeg']);
    }

    // stems check
    if (beat.stems || beat.stemsPrice) {
      if (!beat.stems) {
        throw ApiError.BadRequest('No trackout archive.');
      }
      if (!beat.stemsPrice) {
        throw ApiError.BadRequest('No trackout price.');
      }
      fileService.validateFile(
        beat.stems,
        ['.zip', '.rar'],
        // 500mb
        500 * 1024 * 1024
      );
    }
  }
  async beatAwsUpload(beat: BeatUploadInput): Promise<{
    wave?: string;
    mp3?: string;
    image?: string;
    stems?: string;
  }> {
    const fileData: any = [null, null, null, null];
    fileData[0] = fileService.awsUpload(beat.wave, 'wave/');
    fileData[1] = fileService.awsUpload(beat.mp3, 'mp3/');
    if (beat.image) {
      fileData[2] = fileService.awsUpload(beat.image, 'image/');
    }
    if (beat.stems) {
      fileData[3] = fileService.awsUpload(beat.stems, 'stems/');
    }
    // async files upload
    const data = await Promise.all(fileData).then((values: aws.S3.Object[]) => {
      return {
        wave: values[0].Key,
        mp3: values[1].Key,
        image: values[2] ? values[2].Key : undefined,
        stems: values[3] ? values[3].Key : undefined,
      };
    });
    return data;
  }
  async beatAwsDelete(beat: PrismaClient.Beat) {
    const fileData: any = [null, null, null, null];
    fileData[0] = fileService.deleteObject(beat.wave);
    fileData[1] = fileService.deleteObject(beat.mp3);
    if (beat.image) {
      fileData[2] = fileService.deleteObject(beat.image);
    }
    if (beat.stems) {
      fileData[3] = fileService.deleteObject(beat.stems);
    }
    // async files deletion
    return await Promise.all(fileData);
  }
  async uploadBeat(beat: BeatUploadInput): Promise<PrismaClient.Beat> {
    // aws upload
    const fileData = await this.beatAwsUpload(beat);
    const beatData = {
      ...beat,
      ...fileData,
    } as PrismaClient.Beat;
    const beatFromDb = await prisma.beat.create({
      data: beatData,
      include: {
        tags: true,
      },
    });
    return beatFromDb;
  }
  async deleteBeat(beat: PrismaClient.Beat) {
    // delete media files from AWS S3
    await this.beatAwsDelete(beat);
    // delete beat from db
    await prisma.beat.delete({
      where: {
        id: beat.id,
      },
    });
  }
}

export default new BeatService();
