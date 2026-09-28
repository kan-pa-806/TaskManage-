const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { getIssues } = require('../controllers/issueController');
const { getSprints, createSprint } = require('../controllers/sprintController');

router.route('/').get(getProjects).post(createProject);
router.route('/:id').get(getProject).put(updateProject).delete(deleteProject);

// Nested routes for project issues and sprints
router.route('/:id/issues').get(getIssues);
router.route('/:id/sprints').get(getSprints).post(createSprint);

module.exports = router;
