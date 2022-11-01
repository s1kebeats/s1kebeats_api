const authorService = require('../services/author-service');

class AuthorController {
  async getAuthors(req, res, next) {
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
  async getIndividualAuthor(req, res, next) {
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
