const express = require('express');

const router = express.Router();
const queryPage = require('../controllers/QueryPage');
const { query } = require('../models/mimicDbConnector');

// will create routes for queries
// router.get('/',queryPage.displayTables);
router.post('/',queryPage.displayTables);
router.get('/getCSVData',queryPage.queryCSVResult);
router.get('/get-dropdown',queryPage.getColumnSelectionDropdown);
router.get('/get-columnValues',queryPage.getColumnValues);
module.exports = router;



