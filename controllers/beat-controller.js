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
  async upload(err, req, res, next) {
    // file upload middleware errors serving
    if (err) {
      return next(err);
    }
    if (req.files) {
      return res.json(req.files);
    }
  }
}

module.exports = new AuthorController();
