'use strict';
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
const localStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}/${nanoid(36)}`);
  },
});
const upload = multer({
  // storage: multerS3({
  //   s3: s3,
  //   bucket: process.env.AWS_BUCKET_NAME,
  //   key: (req, file, cb) => {
  //     // aws nesting based on filename
  //     cb(null, `${file.fieldname}/${nanoid(36)}`);
  //   },
  // }),
  storage: localStorage,
  limits: {
    fileSize: 500 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    // file extension
    const ext = path.extname(file.originalname);
    // const fileSize = parseInt(req.headers['content-length']);
    // filters for file fields
    if (file.fieldname == 'image') {
      if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
        cb(
          ApiError.BadRequest('Отправьте изображение в формате PNG или JPEG'),
          false
        );
      }
      // accept the file
      cb(null, true);
      return;
    }
    if (file.fieldname == 'wave') {
      if (ext !== '.wav') {
        cb(ApiError.BadRequest('Отправьте аудио в формате WAV'), false);
      }
      // if (fileSize <= 300 * 1024 * 1024) {
      //   // accept the file
      //   cb(null, true);
      // } else {
      //   cb(ApiError.BadRequest('Максимальный размер 300мб'));
      // }
      // accept the file
      cb(null, true);
    }
    if (file.fieldname == 'mp3') {
      if (ext !== '.mp3') {
        cb(ApiError.BadRequest('Отправьте аудио в формате MP3'), false);
      }
      // if (fileSize <= 150 * 1024 * 1024) {
      //   // accept the file
      //   cb(null, true);
      // } else {
      //   cb(ApiError.BadRequest('Максимальный размер 150мб'));
      // }
      // accept the file
      cb(null, true);
      return;
    }
    if (file.fieldname == 'stems') {
      if (ext !== '.rar' && ext !== '.zip') {
        return cb(
          ApiError.BadRequest('Отправьте архив в формате ZIP или RAR'),
          false
        );
      }
      // if (fileSize <= 500 * 1024 * 1024) {
      //   // accept the file
      //   cb(null, true);
      // } else {
      //   cb(ApiError.BadRequest('Максимальный размер 500мб'));
      // }
      // accept the file
      cb(null, true);
      return;
    }
  },
});
module.exports = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'wave', maxCount: 1 },
  { name: 'mp3', maxCount: 1 },
  { name: 'stems', maxCount: 1 },
]);
