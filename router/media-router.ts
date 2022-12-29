import { Router } from "express";
const router = Router();
import { body } from "express-validator";
import authMiddleware from "../middlewares/auth-middleware.js";
import mediaController from "../controllers/media-controller.js";

// getting media
router.get("/:path/:key", mediaController.getMedia);
// uploading media to aws s3
router.post(
  "/upload",
  authMiddleware,
  body("file").notEmpty().bail(),
  body("path").notEmpty().bail(),
  mediaController.upload
);

export default router;
