const express = require('express');
const router = express.Router();
const { searchAll } = require('../controllers/searchController');

router.route('/').get(searchAll);

module.exports = router;
