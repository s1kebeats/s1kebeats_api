import PrismaClient from '@prisma/client';
import authorSelect from '../prisma-selects/author-select';
import authorIndividualSelect from '../prisma-selects/author-individual-select';

const prisma = new PrismaClient.PrismaClient();

class AuthorService {
  // returns all authors
  async getAuthors() {
    const authors = await prisma.user.findMany({
      select: authorSelect,
    });
    return authors;
  }
  // find author by query (username or displayedName)
  async findAuthors(query: string): Promise<PrismaClient.User[]> {
    const authorFindManyArgs: PrismaClient.Prisma.UserFindManyArgs = {
      where: {
        OR: [
          {
            username: {
              contains: query,
            },
          },
          {
            displayedName: {
              contains: query,
            },
          },
        ],
      },
      select: authorSelect,
    };
    const authors = await prisma.user.findMany(authorFindManyArgs);
    return authors;
  }
  async getAuthorByUsername(
    username: string
  ): Promise<PrismaClient.User | null> {
    const authorFindUniqueArgs: PrismaClient.Prisma.UserFindUniqueArgs = {
      where: {
        username,
      },
      select: authorIndividualSelect,
    };
    const author = await prisma.user.findUnique(authorFindUniqueArgs);
    return author;
  }
}

export default new AuthorService();
