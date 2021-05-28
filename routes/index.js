const express = require('express');
const home = require('../controllers/home');
const router = express.Router();

router.get('/',home.homeController);

router.use('/query',require('./queryPage'));





module.exports = router;