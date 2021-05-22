const mysql = require('mysql2');

const connection = mysql.createConnection({
    host:'localhost',
    user:'mimicDB',
    password:'mimicDB123',
    database: 'mimic'
});

connection.connect();


module.exports =  connection;