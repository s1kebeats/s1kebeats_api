import PrismaClient from "@prisma/client";
import authorSelect, { Author } from "../prisma-selects/author-select.js";
import authorIndividualSelect, { AuthorIndividual } from "../prisma-selects/author-individual-select.js";
import ApiError from "../exceptions/api-error.js";

const prisma = new PrismaClient.PrismaClient();

class AuthorService {
  // returns all authors
  async getAuthors(viewed: number): Promise<Author[]> {
    const authors = await prisma.user.findMany({
      ...authorSelect,
      take: 10,
      skip: viewed,
    });
    return authors;
  }

  // find author by query (username or displayedName)
  async findAuthors(query: string, viewed: number): Promise<Author[]> {
    const authorFindManyArgs = {
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
      ...authorSelect,
      take: 10,
      skip: viewed,
    };
    const authors = await prisma.user.findMany(authorFindManyArgs);
    return authors;
  }

  // individual author data
  async getAuthorByUsername(username: string): Promise<AuthorIndividual> {
    const authorFindUniqueArgs = {
      where: {
        username,
      },
      ...authorIndividualSelect,
    };
    const author = await prisma.user.findUnique(authorFindUniqueArgs);
    if (!author) {
      throw ApiError.NotFound(`Author was not found.`);
    }
    return author;
  }
}

export default new AuthorService();
