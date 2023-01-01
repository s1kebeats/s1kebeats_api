import aws from "aws-sdk";
import { UploadedFile } from "express-fileupload";
import { nanoid } from "nanoid";
import path from "path";
import ApiError from "../exceptions/api-error.js";

const awsConfig: aws.S3.ClientConfiguration = {
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  region: process.env.AWS_BUCKET_REGION!,
};
const s3 = new aws.S3(awsConfig);

class MediaService {
  // file validation function with extension and maxSize
  validate(file: UploadedFile, extensions?: string | string[], maxSize?: number) {
    // extensions validation
    if (extensions) {
      // get file extension
      const ext = path.extname(file.name);
      // multiple
      if (Array.isArray(extensions)) {
        if (!extensions.includes(ext)) {
          throw ApiError.BadRequest(`Send file in ${extensions.join("/")} format.`);
        }
      } else {
        // single
        if (ext !== extensions) {
          throw ApiError.BadRequest(`Send file in ${extensions} format.`);
        }
      }
    }
    // maxSize validation
    if (maxSize) {
      if (file.size > maxSize) {
        throw ApiError.BadRequest(`Max file size is ${maxSize / 1024 / 1024}mb.`);
      }
    }
  }
  validateMedia(file: UploadedFile, path: string) {
    switch (path) {
      case "image": {
        this.validate(file, [".png", ".jpg", ".jpeg"]);
        break;
      }
      case "mp3": {
        this.validate(
          file,
          ".mp3",
          // 150mb
          150 * 1024 * 1024
        );
        break;
      }
      case "wav": {
        this.validate(
          file,
          ".wav",
          // 300mb
          300 * 1024 * 1024
        );
        break;
      }
      case "stems": {
        this.validate(
          file,
          [".zip", ".rar"],
          // 500mb
          500 * 1024 * 1024
        );
        break;
      }
    }
  }
  // upload a file to aws s3 bucket
  async awsUpload(file: UploadedFile, path: string): Promise<aws.S3.Object> {
    const params: aws.S3.PutObjectRequest = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: path + '/' + nanoid(36),
      Body: file.data,
    };
    return s3.upload(params).promise();
  }
  async deleteObject(key: string) {
    const params: aws.S3.DeleteObjectRequest = {
      Key: key,
      Bucket: process.env.AWS_BUCKET_NAME!,
    };
    return s3.deleteObject(params).promise();
  }
  // get a file from aws s3 bucket and send it to the client
  async getMedia(key: string): Promise<aws.Request<aws.S3.GetObjectOutput, aws.AWSError>> {
    const data = await s3.getObject({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
    });
    return data;
  }
}

export default new MediaService();
