import PrismaClient from "@prisma/client";
const beatSelect = PrismaClient.Prisma.validator<PrismaClient.Prisma.BeatArgs>()({
  select: {
    id: true,
    name: true,
    bpm: true,
    image: true,
    mp3: true,
    wavePrice: true,
    user: {
      select: {
        id: true,
        username: true,
        displayedName: true,
      },
    },
  },
});
export type Beat = PrismaClient.Prisma.BeatGetPayload<typeof beatSelect>;
export default beatSelect;
