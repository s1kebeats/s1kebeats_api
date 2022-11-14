import PrismaClient from '@prisma/client';
import path from 'path';
const prisma = new PrismaClient.PrismaClient();
import aws from 'aws-sdk';
import ApiError from '../exceptions/api-error.js';
import fileService from './file-service.js';

const beatWithAuthorAndTags =
  PrismaClient.Prisma.validator<PrismaClient.Prisma.BeatArgs>()({
    select: {
      id: true,
      name: true,
      bpm: true,
      user: {
        select: {
          username: true,
          displayedName: true,
        },
      },
      image: true,
      mp3: true,
      wavePrice: true,
      tags: true,
    },
  });
export type BeatWithAuthorAndTags = PrismaClient.Prisma.BeatGetPayload<
  typeof beatWithAuthorAndTags
>;
export interface BeatIndividual extends BeatWithAuthorAndTags {
  related: BeatWithAuthorAndTags[];
}
interface FileMock {
  name: string;
  size: number;
}
export interface BeatUploadInput
  extends Omit<PrismaClient.Beat, 'image' | 'wave' | 'mp3' | 'stems'> {
  tags: PrismaClient.Tag[];
  image: FileMock;
  wave: FileMock;
  mp3: FileMock;
  stems: FileMock;
}

class BeatService {
  // get all beats
  async getBeats(): Promise<BeatWithAuthorAndTags[]> {
    const beats = await prisma.beat.findMany(beatWithAuthorAndTags);
    return beats;
  }
  // find beats with query
  async findBeats({
    tags = [],
    q,
    bpm,
    sort,
  }: {
    tags?: number[];
    q?: string;
    bpm?: string;
    sort?: string;
  }): Promise<BeatWithAuthorAndTags[]> {
    const where: PrismaClient.Prisma.BeatWhereInput = {};
    const queryArgs = {
      orderBy: { [sort ? sort : 'id']: 'desc' },
      where: where,
      ...beatWithAuthorAndTags,
    };
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

    const beat = await prisma.beat.findMany(queryArgs);
    return beat;
  }
  async getBeatById(id: number): Promise<BeatIndividual> {
    const beatFindUniqueArgs = {
      where: {
        id,
      },
      ...beatWithAuthorAndTags,
    };
    const beat = await prisma.beat.findUnique(beatFindUniqueArgs);
    if (!beat) {
      throw ApiError.NotFound(`Бит не найден`);
    }
    // list if related beats (beats with same tags or author)
    const relatedBeats = await this.findBeats({
      tags: beat.tags.map((item: PrismaClient.Tag) => item.id),
      q: beat.user.username,
    });
    return {
      ...beat,
      related: relatedBeats,
    };
  }
  // file validation function with extension and maxSize
  validateFile(
    file: { name: string; size: number },
    extensions?: string | string[],
    maxSize?: number
  ) {
    // extensions validation
    if (extensions) {
      // get file extension
      const ext = path.extname(file.name);
      // multiple
      if (Array.isArray(extensions)) {
        if (!extensions.includes(ext)) {
          throw ApiError.BadRequest(
            `Отправьте файл в формате ${extensions.join('/')}`
          );
        }
      } else {
        // single
        if (ext !== extensions) {
          throw ApiError.BadRequest(`Отправьте файл в формате ${extensions}`);
        }
      }
    }
    // maxSize validation
    if (maxSize) {
      if (file.size > maxSize) {
        throw ApiError.BadRequest(
          `Максимальный размер файла ${maxSize / 1024 / 1024}мб`
        );
      }
    }
  }
  validateBeat(beat: BeatUploadInput) {
    // required beat data check
    if (!beat.wave || !beat.mp3) {
      throw ApiError.BadRequest('Недостаточно информации');
    }

    // tags check
    if (beat.tags && !Array.isArray(beat.tags)) {
      throw ApiError.BadRequest('Неверные теги');
    }

    // files validation
    // wave check
    this.validateFile(
      beat.wave,
      '.wav',
      // 300mb
      300 * 1024 * 1024
    );

    // mp3 check
    this.validateFile(
      beat.mp3,
      '.mp3',
      // 150mb
      150 * 1024 * 1024
    );

    // image check
    if (beat.image) {
      this.validateFile(beat.image, ['.png', '.jpg', '.jpeg']);
    }

    // stems check
    if (beat.stems || beat.stemsPrice) {
      if (!beat.stems) {
        throw ApiError.BadRequest('Отправьте trackout архив');
      }
      if (!beat.stemsPrice) {
        throw ApiError.BadRequest('Добавьте цену на trackout');
      }
      this.validateFile(
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
  async uploadBeat(beat: BeatUploadInput) {
    // aws upload + prisma create
    const fileData = await this.beatAwsUpload(beat);
    const beatData = {
      ...beat,
      ...fileData,
    } as PrismaClient.Beat;
    const beatFromDb = await prisma.beat.create({
      data: beatData,
    });
    return beatFromDb;
  }
}

export default new BeatService();
