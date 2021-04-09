const mysql = require('mysql');

const connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'Zeroemission9',
    database: 'mimic'
});

connection.connect();


module.exports =  connection;