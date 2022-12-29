import PrismaClient from "@prisma/client";
import authorSelect from "./author-select.js";
const beatIndividualSelect = PrismaClient.Prisma.validator<PrismaClient.Prisma.BeatArgs>()({
  select: {
    id: true,
    name: true,
    bpm: true,
    description: true,
    createdAt: true,
    downloads: true,
    plays: true,
    image: true,
    mp3: true,
    wavePrice: true,
    stemsPrice: true,
    tags: true,
    user: {
      ...authorSelect,
    },
    comments: {
      take: 10,
      select: {
        content: true,
        user: {
          ...authorSelect,
        },
      },
    },
    _count: {
      select: {
        likes: true,
      },
    },
  },
});
export type BeatIndividual = PrismaClient.Prisma.BeatGetPayload<typeof beatIndividualSelect>;
export default beatIndividualSelect;
