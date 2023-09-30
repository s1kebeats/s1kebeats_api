import { UploadedFile } from 'express-fileupload';
import path from 'path';
import ApiError from '../exceptions/api-error';
import fs from 'fs';

class MediaService {
  // file validation function with extension and maxSize
  validate(
    file: UploadedFile,
    extensions?: string | string[],
    maxSize?: number
  ) {
    // extensions validation
    if (extensions) {
      // get file extension
      const ext = path.extname(file.name);
      // multiple
      if (Array.isArray(extensions)) {
        if (!extensions.includes(ext)) {
          throw ApiError.BadRequest('invalid file format');
        }
      } else {
        // single
        if (ext !== extensions) {
          throw ApiError.BadRequest('invalid file format');
        }
      }
    }
    // maxSize validation
    if (maxSize) {
      if (file.size > maxSize) {
        throw ApiError.BadRequest(`max size ${maxSize / 1024 / 1024}mb`);
      }
    }
  }

  validateMedia(file: UploadedFile, path: string) {
    switch (path) {
      case 'image': {
        this.validate(file, ['.png', '.jpg', '.jpeg']);
        break;
      }
      case 'mp3': {
        this.validate(
          file,
          '.mp3',
          // 150mb
          150 * 1024 * 1024
        );
        break;
      }
      case 'wave': {
        this.validate(
          file,
          '.wav',
          // 300mb
          300 * 1024 * 1024
        );
        break;
      }
      case 'stems': {
        this.validate(
          file,
          ['.zip', '.rar'],
          // 500mb
          500 * 1024 * 1024
        );
        break;
      }
      default: {
        throw ApiError.BadRequest('invalid path');
      }
    }
  }

  async upload(file: UploadedFile, dir: string) {
    file.mv(`./server/${dir}/${file.name}`, function (err) {
      if (err) throw err;
    });
    return `${dir}/${file.name}`;
  }

  async deleteMedia(location: string) {
    await fs.unlink(path.resolve(`server/${location}`), (error: any) => {
      if (error) throw error;
    });
  }
}

export default new MediaService();
