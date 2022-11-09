const ApiError = require('../exceptions/api-error');
const beatService = require('../services/beat-service');
const { validationResult } = require('express-validator');

class AuthorController {
  async getBeats(req, res, next) {
    try {
      let beats;
      if (req.query) {
        beats = await beatService.findBeats(req.query);
      } else {
        beats = await beatService.getBeats();
      }
      return res.json(beats);
    } catch (error) {
      next(error);
    }
  }
  async getIndividualBeat(req, res, next) {
    try {
      const beat = await beatService.getBeatById(req.params.id);
      return res.json(beat);
    } catch (error) {
      next(error);
    }
  }
  async upload(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка валидации', errors.array()));
      }
      const beatCandidate = {
        name: req.body.name,
        bpm: req.body.bpm,
        description: req.body.description,
        image: req.files.image,
        wave: req.files.wave,
        mp3: req.files.mp3,
        stems: req.files.stems,
        wavePrice: req.body.wavePrice,
        stemsPrice: req.body.stemsPrice,
      };
      beatService.validateBeat(beatCandidate)
      const beat = await beatService.uploadBeat(beatCandidate);
      return res.json(beat);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthorController();
