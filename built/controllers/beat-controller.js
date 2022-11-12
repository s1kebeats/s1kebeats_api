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
const ApiError = require('../exceptions/api-error');
const beatService = require('../services/beat-service');
const { validationResult } = require('express-validator');
class AuthorController {
  getBeats(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        let beats;
        if (req.query) {
          beats = yield beatService.findBeats(req.query);
        } else {
          beats = yield beatService.getBeats();
        }
        return res.json(beats);
      } catch (error) {
        next(error);
      }
    });
  }
  getIndividualBeat(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        const beat = yield beatService.getBeatById(req.params.id);
        return res.json(beat);
      } catch (error) {
        next(error);
      }
    });
  }
  upload(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return next(ApiError.BadRequest('Ошибка валидации', errors.array()));
        }
        const beatCandidate = Object.assign(
          Object.assign(
            Object.assign(Object.assign({}, req.body), {
              tags: JSON.parse(req.body.tags),
              wavePrice: +req.body.wavePrice,
            }),
            req.files
          ),
          { userId: req.user.id }
        );
        // convers strings to numbers
        if (beatCandidate.bpm) {
          beatCandidate.bpm = +beatCandidate.bpm;
        }
        if (beatCandidate.stemsPrice) {
          beatCandidate.stemsPrice = +beatCandidate.stemsPrice;
        }
        // beat data validation
        beatService.validateBeat(beatCandidate);
        const beat = yield beatService.uploadBeat(beatCandidate);
        return res.json(beat);
      } catch (error) {
        next(error);
      }
    });
  }
}
module.exports = new AuthorController();
