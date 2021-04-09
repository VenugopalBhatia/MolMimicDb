const express = require('express')
const db = require('../models/mimicDbConnector');

var queryResult = [];
module.exports.displayTables = function(req,res){
    db.query("SELECT * from virus_domainpair",function(err,rows,fields){
        if(err){
            console.log("Error",err);
        }else{
            
            var columnNames = Object.keys(rows[0]);
            queryResult = rows;
            // console.log(queryResult);
            res.render('QueryPage',{
                rows:rows,
                columns : columnNames
            })
        }
    });
    
};

module.exports.queryResult = function(req,res){
    var parsedQuery = JSON.parse(JSON.stringify(queryResult));
    console.log(parsedQuery);
}