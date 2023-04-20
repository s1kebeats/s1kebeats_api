import express, { Router } from "express";
import { body } from "express-validator";
import path from "path";
import authMiddleware from "../middlewares/auth-middleware";
import mediaController from "../controllers/media-controller";
import validationMiddleware from "../middlewares/validation-middleware";
const router = Router();

router.post("/upload", authMiddleware, body("path").notEmpty().bail(), validationMiddleware, mediaController.upload);
router.get("/", express.static(path.resolve("server")));

export default router;
