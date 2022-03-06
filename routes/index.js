const express = require('express');
const home = require('../controllers/home');
const queryPage = require('../controllers/QueryPage');
const router = express.Router();

router.get('/',home.homeController);

router.use('/query',require('./queryPage'));
router.get('/domain_form',queryPage.getDomainForm);
router.get('/motif_form',queryPage.getMotifForm);
router.get('/interpretations_page',queryPage.getInterpretationPage);



module.exports = router;