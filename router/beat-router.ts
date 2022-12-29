import beatController from "../controllers/beat-controller.js";
import authMiddleware from "../middlewares/auth-middleware.js";
import { body, param, query } from "express-validator";
import { Router } from "express";
import validationMiddleware from "../middlewares/validation-middleware.js";
const router = Router();

router.post(
  "/upload",
  authMiddleware,
  // name required, 255 characters max
  body("name").notEmpty().bail().isLength({ max: 255 }).bail(),
  // wavePrice required, numeric
  body("wavePrice").notEmpty().bail().isDecimal().bail(),
  body("wave").notEmpty().bail(),
  body("mp3").notEmpty().bail(),
  // stemsPrice numeric
  body("stemsPrice").if(body("stems").exists()).notEmpty().bail().if(body("stemsPrice").exists()).isDecimal().bail(),
  body("stems").if(body("stemsPrice").exists()).notEmpty().bail(),
  // bpm numeric
  body("bpm").if(body("bpm").exists()).isDecimal().bail(),
  // description 255 characters max
  body("description").if(body("description").exists()).isLength({ max: 255 }).bail(),
  validationMiddleware,
  beatController.upload
);

router.get(
  "/",
  query("viewed").if(query("viewed").exists()).isDecimal().bail(),
  validationMiddleware,
  beatController.getBeats
);

router.get("/:id", param("id").isDecimal().bail(), validationMiddleware, beatController.getIndividualBeat);

router.post(
  "/:id/comment",
  authMiddleware,
  param("id").isDecimal().bail(),
  body("content").notEmpty().isLength({ max: 255 }).bail(),
  validationMiddleware,
  beatController.comment
);

router.post(
  "/:id/like",
  authMiddleware,
  param("id").isDecimal().bail(),
  validationMiddleware,
  beatController.likeToggle
);

router.post("/:id/delete", authMiddleware, param("id").isDecimal().bail(), validationMiddleware, beatController.delete);

router.post(
  "/:id/edit",
  authMiddleware,
  param("id").isDecimal().bail(),
  // name required, 255 characters max
  body("name").if(body("name").exists()).isLength({ max: 255 }).bail(),
  // wavePrice required, numeric
  body("wavePrice").if(body("wavePrice").exists()).isDecimal().bail(),
  // stemsPrice numeric
  body("stemsPrice").if(body("stemsPrice").exists()).isDecimal().bail(),
  // bpm numeric
  body("bpm").if(body("bpm").exists()).isDecimal().bail(),
  // description 255 characters max
  body("description").if(body("description").exists()).isLength({ max: 255 }).bail(),
  validationMiddleware,
  beatController.edit
);

export default router;
