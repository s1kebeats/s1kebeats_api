import { AWSError } from "aws-sdk";
import { Request, Response, NextFunction } from "express";
import { UploadedFile } from "express-fileupload";
import sharp from "sharp";
import ApiError from "../exceptions/api-error";
import mediaService from "../services/media-service";

class MediaController {
  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      const { path } = req.body;
      if (req.files == null || !req.files.file) {
        next(ApiError.BadRequest("File wasn't provided"));
        return;
      }
      const file = req.files.file as UploadedFile;
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
