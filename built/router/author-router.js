'use strict';
const authorController = require('../controllers/author-controller');
const Router = require('express').Router;
const router = new Router();
router.get('/', authorController.getAuthors);
router.get('/:username', authorController.getIndividualAuthor);
module.exports = router;
