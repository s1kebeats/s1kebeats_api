import authorController from '../controllers/author-controller.js';
import { Router } from 'express';
const router = Router();

router.get('/', authorController.getAuthors);
router.get('/:username', authorController.getIndividualAuthor);

export default router;
