const express = require('express');

const router = express.Router();
const queryPage = require('../controllers/QueryPage');
const { query } = require('../models/mimicDbConnector');

// will create routes for queries
router.get('/',queryPage.getQueryPageOnLoad);
router.post('/',queryPage.displayTables);
router.get('/getCSVData',queryPage.queryCSVResult);
router.post('/getCSVData',queryPage.sendCSVResult);
router.get('/get-dropdown',queryPage.getColumnSelectionDropdown);
router.get('/get-columnValues',queryPage.getColumnValues);
router.get('/download',queryPage.queryCSVResult);

module.exports = router;



