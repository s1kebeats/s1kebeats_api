const PrismaClient = require('@prisma/client').PrismaClient;
const aws = require('aws-sdk');
const path = require('path');
const prisma = new PrismaClient();
const beatSelect = require('../prisma-selects/beat-select');
const beatIndividualSelect = require('../prisma-selects/beat-individual-select');
const ApiError = require('../exceptions/api-error');

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
  async uploadBeat(beat) {
    // // required beat data check
    // if (!beat.wave || !beat.mp3) {
    //   throw ApiError.BadRequest('Недостаточно информации');
    // }
    // // required files extension check
    // // wave check
    // let ext = path.extname(beat.wave.name);
    // if (ext !== '.wav') {
    //   throw ApiError.BadRequest('Отправьте аудио в формате wav');
    // }
    // // mp3 check
    // ext = path.extname(beat.mp3.name);
    // if (ext !== '.mp3') {
    //   throw ApiError.BadRequest('Отправьте аудио в формате mp3');
    // }
    // // image check
    // if (beat.image) {
    //   ext = path.extname(beat.image.name);
    //   if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
    //     throw ApiError.BadRequest(
    //       'Отправьте изображение в формате png или jpeg'
    //     );
    //   }
    // }
    // // stems check
    // if (beat.stems) {
    //   ext = path.extname(beat.stems.name);
    //   if (ext !== '.zip' && ext !== '.rar') {
    //     throw ApiError.BadRequest('Отправьте архив в формате zip или rar');
    //   }
    // }
  }
}

module.exports = new BeatService();
