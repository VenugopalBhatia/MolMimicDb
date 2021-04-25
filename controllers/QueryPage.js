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
    // console.log("****** Request body ******",req.body);
    let query_ = ""
    let queryRaw = ""
    if(req.body.searchByColumn == null || req.body.tableColumns == null){
        queryRaw = `SELECT DISTINCT * from ${req.body.pathogenSelection}`
        query_ = `SELECT a.count , c.* from (${queryRaw} LIMIT 2000) c,(SELECT DISTINCT COUNT(*) count from ${req.body.pathogenSelection}) a`
    }else{
        var sbc = JSON.stringify(req.body.searchByColumn)
        sbc = sbc.replace("[","")
        sbc = sbc.replace("]","")
        sbc = sbc.trim()
        // console.log("***** sbc *****",sbc)
        
        queryRaw = `SELECT distinct * from ${req.body.pathogenSelection} where ${req.body.tableColumns} IN (${sbc})`
        query_ = `SELECT a.count, c.* from (${queryRaw} LIMIT 2000) c,(SELECT DISTINCT COUNT(*) count from ${req.body.pathogenSelection} where ${req.body.tableColumns} IN (${sbc})) a`
        // console.log("***** Query *****",query_)
    }
    
    db.query(query_,function(err,rows,fields){
        // console.log("*******ROWS",rows[0].count)
        if(err){
            console.log("Error",err);
            return res.render('QueryPage',{
                rows:[],
                columns :[],
                message: "An error occurred in running query: " + err
            })
        }else{
            try{
                if(rows.length!=0){
                    var columnNames = Object.keys(rows[0]);
                    var tableLength = rows[0].count
                    columnNames.splice(0,1)
                    let allFieldvals = rows.map(function(row){ return row[req.body.tableColumns] })
                    // console.log(allFieldvals)
                    let allFieldValuesSet = new Set(allFieldvals)
                    let sbcSet = new Set(req.body.searchByColumn)
                    let valuesNotPresent = [...sbcSet].filter(x=>!allFieldValuesSet.has(x))
                    queryResult = queryRaw;
                    // console.log(queryResult);
                    return res.render('QueryPage',{
                    rows:rows,
                    columns : columnNames,
                    ColumnName: req.body.tableColumns,
                    ColumnValues:sbc,
                    valuesNotPresent:valuesNotPresent,
                    TableLength:tableLength
                    })

                }else{
                    return res.render('QueryPage',{
                        rows:[],
                        columns :[],
                        message: "No results found, kindly check filter parameters"
                    })
                }
               
            }catch(err){
                res.render('QueryPage',{
                    rows:[],
                    columns :[],
                    message: "An error occurred in running query: " + err
                })
            
            }
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
        // console.log("Fields",fields)
        if(err){
            console.log("Error",err);
            if(req.xhr){
                return res.status(500).json({
                    message: "error"

                })
            }
        }else{
            
            
            if(req.xhr){
                return res.status(200).json({
                    message: "Columns",
                    data: rows

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
