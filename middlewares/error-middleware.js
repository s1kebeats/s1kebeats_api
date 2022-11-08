const ApiError = require('../exceptions/api-error');

module.exports = function (err, req, res, next) {
  console.log(err);
  if (err instanceof ApiError) {
    return res.status(400).json({ message: err.message, errors: err.errors });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      message: 'Максимальный размер файла 500мб',
    });
  }

  return res.status(500).json({ message: 'Произошла непредвиденная ошибка' });
};
