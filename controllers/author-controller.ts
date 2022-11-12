import authorService from '../services/author-service'
import { Request, Response, NextFunction } from 'express';

class AuthorController {
  async getAuthors(req: Request, res: Response, next: NextFunction) {
    try {
      let authors;
      if (req.query.q) {
        authors = await authorService.findAuthors(req.query.q);
      } else {
        authors = await authorService.getAuthors();
      }
      return res.json(authors);
    } catch (error) {
      next(error);
    }
  }
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

module.exports = new AuthorController();
