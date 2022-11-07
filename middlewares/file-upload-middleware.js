const multer = require('multer');
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');
const nanoid = require('nanoid');
const ApiError = require('../exceptions/api-error');
const path = require('path');

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: process.env.AWS_BUCKET_REGION,
});

const s3 = new aws.S3();
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    key: (req, file, cb) => {
      // aws nesting based on file name
      cb(null, `${file.fieldname}/${nanoid(36)}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    // file extension
    const ext = path.extname(file.originalname);
    // filter for image
    if (file.fieldname == 'image') {
      if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
        cb(ApiError.BadRequest('Отправьте изображение в формате PNG или JPEG'));
      } else {
        cb(null, true);
      }
      return
    }
    if (file.fieldname == 'wave') {
      if (ext !== '.wav') {
        cb(ApiError.BadRequest('Отправьте аудио в формате WAV'));
      } else {
        cb(null, true);
      }
      return
    }
    if (file.fieldname == 'mp3') {
      if (ext !== '.mp3') {
        cb(ApiError.BadRequest('Отправьте аудио в формате MP3'));
      } else {
        cb(null, true);
      }
      return
    }
    if (file.fieldname == 'stems') {
      if (ext !== '.rar' && ext !== '.zip') {
        cb(ApiError.BadRequest('Отправьте архив в формате ZIP или RAR'));
      } else {
        cb(null, true);
      }
      return
    }
  },
});

module.exports = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'wave', maxCount: 1 },
  { name: 'mp3', maxCount: 1 },
  { name: 'stems', maxCount: 1 },
]);
