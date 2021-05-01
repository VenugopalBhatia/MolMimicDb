const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/cachingdb');

const cachingDb = mongoose.connection;

cachingDb.on('error',console.error.bind("Error connecting to database"));

cachingDb.once('open',function(){
    console.log("Successfully connected to database")
});

module.exports = cachingDb;