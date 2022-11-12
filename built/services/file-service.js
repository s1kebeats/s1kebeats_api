'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
const aws = require('aws-sdk');
const nanoid = require('nanoid');
const s3 = new aws.S3({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: process.env.AWS_BUCKET_REGION,
});
class FileService {
  awsUpload(file, path) {
    return __awaiter(this, void 0, void 0, function* () {
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: path + nanoid(36),
        Body: file.data,
      };
      return s3.upload(params).promise();
    });
  }
  getMedia(key) {
    return __awaiter(this, void 0, void 0, function* () {
      const data = yield s3.getObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
      });
      return data;
    });
  }
}
module.exports = new FileService();
