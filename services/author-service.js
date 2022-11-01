const PrismaClient = require('@prisma/client').PrismaClient;
const prisma = new PrismaClient();
const authorSelect = require('../prisma-selects/author-select')

class AuthorService {
    async getAuthors() {
        const authors = await prisma.user.findMany({
            select: authorSelect
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
            select: authorSelect
        });
        return authors;
    }
}

module.exports = new AuthorService();
