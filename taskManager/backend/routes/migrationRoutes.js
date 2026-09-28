const express = require('express');
const router = express.Router();
const { migrateTasks } = require('../controllers/migrationController');

router.route('/migrate-tasks').post(migrateTasks);

module.exports = router;
