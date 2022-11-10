const PrismaClient = require('@prisma/client').PrismaClient;
const path = require('path');
const prisma = new PrismaClient();
const beatSelect = require('../prisma-selects/beat-select');
const beatIndividualSelect = require('../prisma-selects/beat-individual-select');
const ApiError = require('../exceptions/api-error');
const fileService = require('../services/file-service');

class BeatService {
  async getBeats() {
    const beats = await prisma.beat.findMany({
      select: beatSelect,
    });
    return beats;
  }
  async findBeats({ tags, q, bpm, sort }) {
    const queryArgs = {
      orderBy: { [sort ? sort : 'id']: 'desc' },
      where: {},
    };

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
            author: {
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
        equals: bpm,
      };
    }

    const beat = await prisma.beat.findMany(queryArgs);
    return beat;
  }
  async getBeatById(id) {
    const beat = await prisma.beat.findUnique({
      where: {
        id,
      },
      select: beatIndividualSelect,
    });
    const relatedBeats = await this.findBeats({
      tags: beat.tags,
      q: beat.user.username,
    });
    return {
      ...beat,
      related: relatedBeats,
    };
  }
  // file validation function with extension and maxSize
  validateFile(file, extensions, maxSize) {
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
  validateBeat(beat) {
    // required beat data check
    if (!beat.wave || !beat.mp3) {
      throw ApiError.BadRequest('Недостаточно информации');
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
  async beatAwsUpload(beat) {
    const fileData = {};
    fileData.wave = await fileService.awsUpload(beat.wave, 'wave/');
    fileData.mp3 = await fileService.awsUpload(beat.mp3, 'mp3/');
    if (beat.image) {
      fileData.image = await fileService.awsUpload(beat.image, 'image/');
    }
    if (beat.stems) {
      fileData.stems = await fileService.awsUpload(beat.stems, 'stems/');
    }
    return fileData;
  }
  async uploadBeat(beat) {
    // aws upload + prisma create
    const fileData = await this.beatAwsUpload(beat);
    const beatFromDb = await prisma.beat.create({
      data: {
        ...beat,
        ...fileData,
      },
    });
    return beatFromDb;
  }
}

module.exports = new BeatService();
