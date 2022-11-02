const PrismaClient = require('@prisma/client').PrismaClient;
const prisma = new PrismaClient();
const beatSelect = require('../prisma-selects/beat-select');
const beatIndividualSelect = require('../prisma-selects/beat-individual-select');

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
}

module.exports = new BeatService();
