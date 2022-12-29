import authorController from "../controllers/author-controller.js";
import { Router } from "express";
const router = Router();

// get many authors
router.get("/", authorController.getAuthors);

// get individual author
router.get("/:username", authorController.getIndividualAuthor);

export default router;
