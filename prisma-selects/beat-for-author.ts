import PrismaClient from '@prisma/client';
const beatForAuthorSelect =
  PrismaClient.Prisma.validator<PrismaClient.Prisma.BeatArgs>()({
    select: {
      id: true,
      name: true,
      bpm: true,
      image: true,
      mp3: true,
      wavePrice: true,
      tags: true,
    },
  });
export type BeatForAuthor = PrismaClient.Prisma.BeatGetPayload<
  typeof beatForAuthorSelect
>;
export default beatForAuthorSelect;
