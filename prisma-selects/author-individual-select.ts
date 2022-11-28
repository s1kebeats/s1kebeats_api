import beatSelect from './beat-select.js';
import PrismaClient from '@prisma/client';
const authorIndividualDto = PrismaClient.Prisma.validator<PrismaClient.Prisma.UserArgs>()({
  select: {
    username: true,
    createdAt: true,
    displayedName: true,
    about: true,
    image: true,
    beats: {
      select: {
        ...new beatSelect({
          user: false,
          plays: true,
        }),
      },
    },
    youtube: true,
    instagram: true,
    vk: true,
    _count: {
      select: {
        beats: true,
      },
    },
  }
})
export type AuthorIndividualDto = PrismaClient.Prisma.UserGetPayload<
  typeof authorIndividualDto
>;
export default authorIndividualDto;
