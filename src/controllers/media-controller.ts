import { Request, Response, NextFunction } from "express";
import { UploadedFile } from "express-fileupload";
import sharp from "sharp";
import ApiError from "../exceptions/api-error";
import mediaService from "../services/media-service";
import path from "path";
import { open, close } from "fs";
import fs from "fs";

class MediaController {
  // local media server
  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      const { path } = req.body;
      if (req.files == null || !req.files.file) {
        next(ApiError.BadRequest("no file"));
        return;
      }
      const file = req.files.file as UploadedFile;
      mediaService.validateMedia(file, path);
      if (path === "image") {
        file.data = await sharp(file.data).webp({ quality: 50 }).toBuffer();
      }
      const filePath = await mediaService.upload(file, path);
      return res.json(filePath);
    } catch (error) {
      next(error);
    }
  }
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { file, path: folder } = req.params;
      const filePath = path.resolve(`server/${folder}/${file}`);

      open(filePath, "r", (err, fd) => {
        if (err) {
          if (err.code === "ENOENT") {
            next(ApiError.NotFound("File does not exist."));
            return;
          }

          throw err;
        }
        try {
          res.writeHead(200, {
            "Content-Type": "application/octet-stream",
            "Content-Disposition": "attachment",
          });
          fs.createReadStream(filePath).pipe(res);
          return;
        } finally {
          close(fd, (err) => {
            if (err) throw err;
          });
        }
      });
    } catch (error: any) {
      next(error);
    }
  }
}

export default new MediaController();
