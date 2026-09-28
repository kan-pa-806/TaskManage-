const express = require('express');
const router = express.Router();
const {
  getIssues,
  getIssue,
  createIssue,
  updateIssue,
  deleteIssue,
} = require('../controllers/issueController');
const { getComments, createComment } = require('../controllers/commentController');

router.route('/').get(getIssues).post(createIssue);
router.route('/:id').get(getIssue).put(updateIssue).delete(deleteIssue);

// Nested routes for issue comments
router.route('/:id/comments').get(getComments).post(createComment);

module.exports = router;
