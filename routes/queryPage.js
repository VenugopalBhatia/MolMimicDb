const express = require('express');

const router = express.Router();
const queryPage = require('../controllers/QueryPage');

// will create routes for queries
router.get('/',queryPage.displayTables);
router.get('/getData',queryPage.queryResult);
router.get('/get-dropdown',queryPage.getColumnSelectionDropdown);
module.exports = router;



