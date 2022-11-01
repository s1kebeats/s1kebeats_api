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
  async findBeats(query) {}
  async getBeatById(id) {
    const beat = await prisma.beat.findUnique({
      where: {
        id,
      },
      select: beatIndividualSelect,
    });
    const relatedBeats = await this.findBeats();
    return {
      ...beat,
      related: relatedBeats,
    };
  }
}

module.exports = new BeatService();
