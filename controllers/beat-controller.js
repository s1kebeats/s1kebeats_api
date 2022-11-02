const beatService = require('../services/beat-service');
const multer = require('multer');

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
      await multer();
      return res.json(req.file);
    } catch (error) {}
  }
}

module.exports = new AuthorController();
