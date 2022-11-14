import authorService from '../services/author-service.js';
import { Request, Response, NextFunction } from 'express';

class AuthorController {
  async getAuthors(req: Request, res: Response, next: NextFunction) {
    try {
      let authors;
      const query = req.query.q as string;
      if (query) {
        // find author with query
        authors = await authorService.findAuthors(query);
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
      const author = await authorService.getAuthorByUsername(
        req.params.username
      );
      return res.json(author);
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthorController();
