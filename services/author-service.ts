import PrismaClient from '@prisma/client'
import authorSelect from '../prisma-selects/author-select'
import authorIndividualSelect from '../prisma-selects/author-individual-select'

const prisma = new PrismaClient.PrismaClient();

class AuthorService {
  async getAuthors() {
    const authors = await prisma.user.findMany({
      select: authorSelect,
    });
    return authors;
  }
  async findAuthors(query) {
    const authors = await prisma.user.findMany({
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
    });
    return authors;
  }
  async getAuthorByUsername(username) {
    const author = await prisma.user.findUnique({
      where: {
        username,
      },
      select: authorIndividualSelect,
    });
    return author;
  }
}

module.exports = new AuthorService();
