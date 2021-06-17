const mongoose = require('mongoose');
const env = require('./environment')
mongoose.connect(`mongodb://localhost/${env.cachingdb}`);

const cachingDb = mongoose.connection;

cachingDb.on('error',console.error.bind("Error connecting to database"));

cachingDb.once('open',function(){
    console.log("Successfully connected to database")
});

module.exports = cachingDb;