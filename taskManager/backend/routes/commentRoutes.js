const express = require('express');
const router = express.Router();
const { deleteComment } = require('../controllers/commentController');

router.route('/:id').delete(deleteComment);

module.exports = router;
