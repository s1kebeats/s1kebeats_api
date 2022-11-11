const ApiError = require('../exceptions/api-error');

module.exports = function (err, req, res, next) {
  console.log(err);
  if (
    err.message ===
    'fileService.getMedia(...).createReadStream is not a function'
  ) {
    return res.status(404).json({
      message: 'Файл не существует',
    });
  }
  if (err instanceof ApiError) {
    return res.status(400).json({ message: err.message, errors: err.errors });
  }

  return res.status(500).json({ message: 'Произошла непредвиденная ошибка' });
};
