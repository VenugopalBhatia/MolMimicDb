const express = require('express')
const db = require('../models/mimicDbConnector');

var queryResult = [];
module.exports.displayTables = function(req,res){
    var queryVar = db.query("SELECT * from virus_domainpair",function(err,rows,fields){
        if(err){
            console.log("Error",err);
        }else{
            
            var columnNames = Object.keys(rows[0]);
            queryResult = rows;
            res.render('QueryPage',{
                rows:rows,
                columns : columnNames
            })
        }
    });
    console.log("queryVar",queryVar);
};

module.exports.queryResult = function(req,res,queryResult){
    console.log(queryResult);
}