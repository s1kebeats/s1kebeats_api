import { Request, Response, NextFunction } from "express";
import { UploadedFile } from "express-fileupload";
import sharp from "sharp";
import ApiError from "../exceptions/api-error";
import mediaService from "../services/media-service";
import path from "path";
import fs, { open, close } from "fs";

class MediaController {
  // local media server
  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      const { path } = req.body;
      if (req.files == null) {
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
        if (err != null) {
          if (err.code === "ENOENT") {
            next(ApiError.NotFound("File does not exist."));
            return;
          }

          throw err;
        }
        try {
          fs.createReadStream(filePath).pipe(res);
          res.writeHead(200, {
            "Content-Type": "application/octet-stream",
            "Content-Disposition": "inline",
          });
          return;
        } finally {
          close(fd, (err) => {
            if (err != null) throw err;
          });
        }
      });
    } catch (error: any) {
      next(error);
    }
  }
}

export default new MediaController();
