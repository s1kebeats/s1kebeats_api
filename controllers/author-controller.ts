import authorService from '../services/author-service.js';
import { Request, Response, NextFunction } from 'express';
import PrismaClient from '@prisma/client';
import { Author } from '../prisma-selects/author-select.js';
import { AuthorIndividual } from '../prisma-selects/author-individual-select.js';

class AuthorController {
  async getAuthors(req: Request, res: Response, next: NextFunction) {
    try {
      let authors: Author[] | undefined;
      if (req.query.q) {
        // find authors with query
        authors = await authorService.findAuthors(req.query.q as string);
      } else {
        // get all authors
        authors = await authorService.getAuthors();
      }
      return res.json(authors);
    } catch (error) {
      next(error);
    }
  }
  // get individual author data
  async getIndividualAuthor(req: Request, res: Response, next: NextFunction) {
    try {
      const username = req.params.username;
      const author: AuthorIndividual = await authorService.getAuthorByUsername(
        username
      );
      return res.json(author);
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthorController();
