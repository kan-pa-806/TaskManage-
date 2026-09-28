const express = require('express');
const router = express.Router();
const {
  getSprints,
  getSprint,
  createSprint,
  updateSprint,
  deleteSprint,
} = require('../controllers/sprintController');

router.route('/').get(getSprints).post(createSprint);
router.route('/:id').get(getSprint).put(updateSprint).delete(deleteSprint);

module.exports = router;
