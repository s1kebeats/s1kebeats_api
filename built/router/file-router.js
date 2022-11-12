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
const Router = require('express').Router;
const router = new Router();
const fileService = require('../services/file-service');
const ApiError = require('../exceptions/api-error');
// getting media file
router.get('/:path/:key', (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const { key, path } = req.params;
      // aws getobject
      const media = yield fileService.getMedia(`${path}/${key}`);
      media
        .createReadStream()
        .on('error', (error) => {
          if (error.code === 'AccessDenied') {
            next(ApiError.NotFound('Файл не найден'));
          }
        })
        .pipe(res);
    } catch (error) {
      next(error);
    }
  })
);
module.exports = router;
