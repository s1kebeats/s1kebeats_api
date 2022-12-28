import PrismaClient from '@prisma/client';
import beatForAuthorSelect from './beat-for-author.js';
const authorIndividualSelect = PrismaClient.Prisma.validator<PrismaClient.Prisma.UserArgs>()({
  select: {
    id: true,
    username: true,
    createdAt: true,
    displayedName: true,
    about: true,
    image: true,
    beats: {
      ...beatForAuthorSelect,
    },
    youtube: true,
    instagram: true,
    vk: true,
    _count: {
      select: {
        beats: true,
      },
    },
  },
});
export type AuthorIndividual = PrismaClient.Prisma.UserGetPayload<typeof authorIndividualSelect>;
export default authorIndividualSelect;
