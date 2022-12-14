import { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
const router = Router();
import fileService from '../services/file-service.js';
import ApiError from '../exceptions/api-error.js';
import { AWSError } from 'aws-sdk/lib/error';

// getting media file
router.get(
  '/:path/:key',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { key, path } = req.params;
      // aws getobject
      const media = await fileService.getMedia(`${path}/${key}`);
      media
        .createReadStream()
        .on('error', (error: AWSError) => {
          if (error.code === 'AccessDenied') {
            next(ApiError.NotFound('File was not found.'));
          }
        })
        .pipe(res);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
