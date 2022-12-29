import { Router } from "express";
import { query } from "express-validator";
import tagController from "../controllers/tag-controller.js";
import validationMiddleware from "../middlewares/validation-middleware.js";
const router = Router();

router.get(
  "/",
  query("viewed").if(query("viewed").exists()).isDecimal().bail(),
  validationMiddleware,
  tagController.getTags
);

export default router;
