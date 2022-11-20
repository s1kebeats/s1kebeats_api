import PrismaClient from '@prisma/client';
import authorSelect from '../prisma-selects/author-select.js';
import authorIndividualSelect from '../prisma-selects/author-individual-select.js';
import ApiError from '../exceptions/api-error.js';

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
    if (!author) {
      throw ApiError.NotFound(`Author was not found.`);
    }
    return author;
  }
}

export default new AuthorService();
