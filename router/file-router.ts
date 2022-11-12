const Router = require('express').Router;
const router = new Router();
const fileService = require('../services/file-service');
const ApiError = require('../exceptions/api-error');

// getting media file
router.get('/:path/:key', async (req, res, next) => {
  try {
    const { key, path } = req.params;
    // aws getobject
    const media = await fileService.getMedia(`${path}/${key}`);
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
});

module.exports = router;
