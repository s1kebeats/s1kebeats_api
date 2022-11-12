'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
const PrismaClient = require('@prisma/client').PrismaClient;
const prisma = new PrismaClient();
const authorSelect = require('../prisma-selects/author-select');
const authorIndividualSelect = require('../prisma-selects/author-individual-select');
class AuthorService {
  getAuthors() {
    return __awaiter(this, void 0, void 0, function* () {
      const authors = yield prisma.user.findMany({
        select: authorSelect,
      });
      return authors;
    });
  }
  findAuthors(query) {
    return __awaiter(this, void 0, void 0, function* () {
      const authors = yield prisma.user.findMany({
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
    });
  }
  getAuthorByUsername(username) {
    return __awaiter(this, void 0, void 0, function* () {
      const author = yield prisma.user.findUnique({
        where: {
          username,
        },
        select: authorIndividualSelect,
      });
      return author;
    });
  }
}
module.exports = new AuthorService();
