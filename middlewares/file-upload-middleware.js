const multer = require('multer');
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');
const nanoid = require('nanoid');

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
    key: function (req, file, cb) {
      cb(null, nanoid(36));
    },
  }),
});

module.exports = upload;
