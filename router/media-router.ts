import { Router } from "express";
const router = Router();
import { body } from "express-validator";
import authMiddleware from "../middlewares/auth-middleware.js";
import mediaController from "../controllers/media-controller.js";
import validationMiddleware from "../middlewares/validation-middleware.js";

// getting media
router.get("/:path/:key", mediaController.getMedia);
// uploading media to aws s3
router.post(
  "/upload",
  authMiddleware,
  body("file").notEmpty().bail(),
  body("path").notEmpty().bail(),
  validationMiddleware,
  mediaController.upload
);

export default router;
