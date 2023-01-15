import authorController from "../controllers/author-controller";
import { Router } from "express";
import validationMiddleware from "../middlewares/validation-middleware";
import { query } from "express-validator";
const router = Router();

// get many authors
router.get(
  "/",
  query("viewed").if(query("viewed").exists()).isDecimal().bail(),
  validationMiddleware,
  authorController.getAuthors
);

// get individual author
router.get("/:username", authorController.getIndividualAuthor);

export default router;
