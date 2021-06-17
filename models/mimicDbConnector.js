const mysql = require('mysql2');
const env = require('../config/environment')
const connection = mysql.createConnection(env.db);

connection.connect();


module.exports =  connection;