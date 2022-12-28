import PrismaClient from '@prisma/client';
const authorSelect = PrismaClient.Prisma.validator<PrismaClient.Prisma.UserArgs>()({
  select: {
    id: true,
    username: true,
    displayedName: true,
    image: true,
  },
});
export type Author = PrismaClient.Prisma.UserGetPayload<typeof authorSelect>;
export default authorSelect;
