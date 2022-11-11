const Router = require('express').Router;
const router = new Router();
const ApiError = require('../exceptions/api-error');
const fileService = require('../services/file-service');

// getting media file
router.get('/:path/:key', async (req, res, next) => {
  try {
    const key = req.params.key;
    const path = req.params.path;
    const readStream = await fileService
      .getMedia(`${path}/${key}`)
      .createReadStream();
    // .on('error', () => {next(ApiError.BadRequest('Файл не существует'))});
    readStream.pipe(res);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
