const PrismaClient = require('@prisma/client').PrismaClient;
const prisma = new PrismaClient();
const authorSelect = require('../prisma-selects/author-select');
const authorIndividualSelect = require('../prisma-selects/author-individual-select');

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
