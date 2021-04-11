const e = require('express');
const express = require('express')
const db = require('../models/mimicDbConnector');

var queryResult = [];
module.exports.getQueryPageOnLoad = function(req,res){
    return res.render('QueryPage',{
        rows:[],
        columns :[],
        message: "Welcome! get started by clicking the button on the right"
    })
}
module.exports.displayTables = function(req,res){
    // console.log("Request body",req.body);
    let query_ = ""
    if(req.body.searchByColumn == null || req.body.tableColumns == null){
        query_ = `SELECT distinct * from ${req.body.pathogenSelection}`
    }else{
        var sbc = JSON.stringify(req.body.searchByColumn)
        sbc = sbc.replace("[","")
        sbc = sbc.replace("]","")
        
        query_ = `SELECT distinct * from ${req.body.pathogenSelection} where ${req.body.tableColumns} IN (${sbc}) `
    }
    
    db.query(query_,function(err,rows,fields){
        if(err){
            console.log("Error",err);
            return res.render('QueryPage',{
                rows:[],
                columns :[],
                message: "No results found, kindly check filter parameters"
            })
        }else{
            
            var columnNames = Object.keys(rows[0]);
            queryResult = query_;
            // console.log(queryResult);
            return res.render('QueryPage',{
                rows:rows,
                columns : columnNames,
                ColumnName: req.body.tableColumns,
                ColumnValues:sbc

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

module.exports.getColumnValues = function(req,res){
    let pathogenTable = req.query.pathogenTable;
    let column = req.query.column;
    db.query(`SELECT DISTINCT ${column} FROM ${pathogenTable}`,function(err,rows,fields){
        
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
                queryRes.push(i);
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

module.exports.queryCSVResult = function(req,res){
    var parsedQuery = JSON.parse(JSON.stringify(queryResult));
    console.log(parsedQuery);
}

// module.exports.queryResult = function(req,res){
//     console.log(req.body);
//     return res.redirect('back');
// }
