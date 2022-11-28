import PrismaClient from '@prisma/client';
const authorDto = PrismaClient.Prisma.validator<PrismaClient.Prisma.UserArgs>()({
  select: {
    username: true,
    displayedName: true,
    image: true,
  }
})
export type AuthorDto = PrismaClient.Prisma.UserGetPayload<
  typeof authorDto
>;
export default authorDto;
