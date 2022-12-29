import { AWSError } from "aws-sdk";
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import sharp from "sharp";
import ApiError from "../exceptions/api-error.js";
import mediaService from "../services/media-service.js";

class MediaController {
  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      // express validator errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest("Data validation error.", errors.array()));
      }
      const { file, path } = req.body;
      mediaService.validateMedia(file, path);
      if (path === "image") {
        file.data = await sharp(file.data).webp({ quality: 50 }).toBuffer();
      }
      // aws upload
      const media = await mediaService.awsUpload(file, path);
      return res.json(media.Key);
    } catch (error) {
      next(error);
    }
  }

  async getMedia(req: Request, res: Response, next: NextFunction) {
    try {
      const { key, path } = req.params;
      // aws getobject
      const media = await mediaService.getMedia(`${path}/${key}`);
      media
        .createReadStream()
        .on("error", (error: AWSError) => {
          if (error.code === "AccessDenied") {
            next(ApiError.NotFound("File was not found."));
          }
        })
        .pipe(res);
    } catch (error) {
      next(error);
    }
  }
}

export default new MediaController();
