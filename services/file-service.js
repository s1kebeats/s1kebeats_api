const aws = require('aws-sdk');
const nanoid = require('nanoid');
const s3 = new aws.S3({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: process.env.AWS_BUCKET_REGION,
});

class FileService {
  async awsUpload(file, path) {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: path + nanoid(36),
      Body: file.data,
    };
    const data = await s3.upload(params).promise();
    return data.Key;
  }
}

module.exports = new FileService();
