import authorService from '../services/author-service.js';
import { Request, Response, NextFunction } from 'express';

class AuthorController {
  async getAuthors(req: Request, res: Response, next: NextFunction) {
    try {
      let authors;
      if (Object.keys(req.query).length) {
        // find author with query
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
