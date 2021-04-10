const e = require('express');
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

module.exports.getColumnSelectionDropdown = function(req,res){
    let pathogenTable = req.query.pathogenTable;
    db.query(`SHOW COLUMNS FROM ${pathogenTable}`,function(err,rows,fields){
        
        if(err){
            console.log("Error",err);
            if(req.xhr){
                return res.status(500).json({
                    message: "error"

                })
            }
        }else{
            
            let queryRes = []
            for(let i of rows){
                queryRes.push(i.Field);
            }
            // let queryColumns = JSON.parse(JSON.stringify(columns));
            // console.log(queryColumns)
            if(req.xhr){
                return res.status(200).json({
                    message: "Columns",
                    data: queryRes

                })
            }
        }
    })


}

module.exports.queryResult = function(req,res){
    var parsedQuery = JSON.parse(JSON.stringify(queryResult));
    console.log(parsedQuery);
}