const express = require('express')
const db = require('../models/mimicDbConnector');
// import { Parser } from 'json2csv';
var { Parser } = require('json2csv')
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
        query_ = `SELECT a.count , c.* from (${queryRaw} LIMIT 500) c,(SELECT DISTINCT COUNT(*) count from ${req.body.pathogenSelection}) a`
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
                    if(valuesNotPresent.length && valuesNotPresent[0].length == 1){
                        valuesNotPresent = []
                    }
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

// ********** Callback based getColumn Values

// module.exports.getColumnValues = async function(req,res){
//     let pathogenTable = req.query.pathogenTable;
//     let column = req.query.column;
//     db.query(`SELECT DISTINCT ${column} FROM ${pathogenTable}`,function(err,rows,fields){
//         // console.log("Fields",fields)
//         if(err){
//             console.log("Error",err);
//             if(req.xhr){
//                 return res.status(500).json({
//                     message: "error"

//                 })
//             }
//         }else{
            
            
//             if(req.xhr){
    
//                 return res.status(200).json({
//                     message: "Columns",
//                     data: rows

//                 })
//             }
//         }
//     })
// }

module.exports.getColumnValues = async function(req,res){
    let pathogenTable = req.query.pathogenTable;
    let column = req.query.column;
    try{
        const rows = await db.promise().execute(`SELECT DISTINCT ${column} FROM ${pathogenTable}`)
        if(req.xhr){
            
            return res.status(200).json({
                message: "Columns",
                data: rows[0]
        })
        }
    }
    catch(err){
        console.log("*****Error",err)
        if(req.xhr){
            if(req.xhr){
            return res.status(500).json({
                message: "error"

            })
            }
        }
    }
    

}

module.exports.queryCSVResult = function(req,res){
    // console.log("**** get request")
    if(queryResult.length){
        db.query(queryResult,function(err,rows,fields){
            if(err){
                if(req.xhr){
                    console.log("error")
                    return res.status(500).json({
                        message:err
                    })
                }
                console.log("Error:",err)

            }else{
                try{
                    
                    if(req.xhr){
                        
                        if(rows.length!=0){
                            return res.status(200).json({
                                message: "The following data was returned by the database",
                                data:rows
                            })

                        }else{
                            console.log("error")
                            return res.status(404).json({
                                message: "There was a problem with the query, pls check"
                            })
                        }
                        
                    }

                    const json2csv = new Parser()

                    try{
                        const csv = json2csv.parse(rows)
                        // console.log("parsed data")
                        res.attachment('data.csv')
                        res.status(200).send(csv)
                    }
                    catch(error){
                        console.log('error:', error.message)
                        res.status(500).send(error.message)
                    }

                    


                }
                catch(ReturnDataErr){
                    console.log("Error in returning data",ReturnDataErr)

                }
                
                
            }
        })
    }
}



// export const downloadResource = (res, fileName, data) => {
//     const json2csv = new Parser();
//     const csv = json2csv.parse(data);
//     res.header('Content-Type', 'text/csv');
//     res.attachment(fileName);
//     return res.send(csv);
//   }


// module.exports.queryResult = function(req,res){
//     console.log(req.body);
//     return res.redirect('back');
// }
