import { Router } from "express";
import { query, param } from "express-validator";
import commentController from "../controllers/comment-controller.js";
import authMiddleware from "../middlewares/auth-middleware.js";
import validationMiddleware from "../middlewares/validation-middleware.js";
const router = Router();

router.get(
  "/:id",
  authMiddleware,
  param("id").isDecimal().bail(),
  query("viewed").if(query("viewed").exists()).isDecimal().bail(),
  validationMiddleware,
  commentController.getComments
);
router.post("/delete/:id", param("id").isDecimal().bail(), validationMiddleware, commentController.deleteComment);

export default router;
