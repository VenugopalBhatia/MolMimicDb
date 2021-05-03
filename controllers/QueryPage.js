const express = require('express')
const db = require('../models/mimicDbConnector');
// import { Parser } from 'json2csv';
var { Parser } = require('json2csv');
const Cache = require('../models/cache')


var queryResult = [];
module.exports.getQueryPageOnLoad = function(req,res){
    return res.render('QueryPage',{
        rows:[],
        columns :[],
        message: "Welcome! get started by clicking the button on the right"
    })
}


module.exports.displayTables = async function(req,res){

    var format = /[`!@#$%^&*+=;<>?~]/;

    if((!format.test(req.body.searchByColumn))&(!format.test(req.body.tableColumns))){
        let query_ = ""
        let queryRaw = ""
        if(req.body.searchByColumn == null || req.body.tableColumns == null){
            queryRaw = `SELECT DISTINCT * from ${req.body.pathogenSelection}`
            query_ = `SELECT a.count , c.* from (${queryRaw} LIMIT 500) c,(SELECT DISTINCT COUNT(*) count from ${req.body.pathogenSelection}) a`
        }else{
            var sbc = JSON.stringify(req.body.searchByColumn);
            // sbc = '"' + sbc + '"'
            // var sbc = req.body.searchByColumn;
            // console.log("***** sbc *****",sbc)
            // sbc = sbc.toString()
            sbc = sbc.replace(/^\[([\s\S]*)]$/,'$1');
            // sbc = sbc.replace("^[","");
            // sbc = sbc.replace("]$","");
            // sbc = sbc.trim()
            // console.log("***** sbc *****",sbc)
            
            queryRaw = `SELECT distinct * from ${req.body.pathogenSelection} where ${req.body.tableColumns} IN (${sbc})`
            query_ = `SELECT a.count, c.* from (${queryRaw}) c,(SELECT DISTINCT COUNT(*) count from ${req.body.pathogenSelection} where ${req.body.tableColumns} IN (${sbc})) a`
            // console.log("***** Query *****",query_)
        }

        try{
            var rows = await db.promise().query(query_)
            // console.log(query_)
            rows = rows[0]
            if(rows.length!=0){
                var columnNames = Object.keys(rows[0]);
                var columnDisplay = []
                for(let i in columnNames){
                    // console.log(i)
                    columnDisplay[i] = columnNames[i].replace(/_/g," ")
                    // console.log("after replacement",i)
                }
                // console.log(columnNames)
                var tableLength = rows[0].count
                columnNames.splice(0,1)
                columnDisplay.splice(0,1)
                let allFieldvals = rows.map(function(row){ return row[req.body.tableColumns] })
                // console.log(allFieldvals)
                
                let allFieldValuesSet = new Set(allFieldvals)
                let sbcSet = new Set(req.body.searchByColumn)
                let valuesNotPresent = [...sbcSet].filter(x=>!allFieldValuesSet.has(x)) // Check for user entered values not in db
                if(valuesNotPresent.length && valuesNotPresent[0].length == 1){
                    valuesNotPresent = []
                }
                rows = rows.slice(0,500)
                queryResult = queryRaw;
                // console.log(req.body.tableColumns);
                return res.render('QueryPage',{
                rows:rows,
                columns : columnNames,
                columnsForDisplay: columnDisplay,
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
        }
        catch(err){

            res.render('QueryPage',{
                rows:[],
                columns :[],
                message: "An error occurred in running query: " + err
            })

        }



    }else{
        console.log("Error! Possible Sql Injection!");
        console.log("Column Values",req.body.searchByColumn)
        console.log("Table values",req.body.tableColumns)
        res.redirect('back');

    }

    

}


// ******* callback based displayTables
// module.exports.displayTables = function(req,res){
//     // console.log("****** Request body ******",req.body);
//     let query_ = ""
//     let queryRaw = ""
//     if(req.body.searchByColumn == null || req.body.tableColumns == null){
//         queryRaw = `SELECT DISTINCT * from ${req.body.pathogenSelection}`
//         query_ = `SELECT a.count , c.* from (${queryRaw} LIMIT 500) c,(SELECT DISTINCT COUNT(*) count from ${req.body.pathogenSelection}) a`
//     }else{
//         var sbc = JSON.stringify(req.body.searchByColumn)
//         sbc = sbc.replace("[","")
//         sbc = sbc.replace("]","")
//         sbc = sbc.trim()
//         // console.log("***** sbc *****",sbc)
        
//         queryRaw = `SELECT distinct * from ${req.body.pathogenSelection} where ${req.body.tableColumns} IN (${sbc})`
//         query_ = `SELECT a.count, c.* from (${queryRaw} LIMIT 500) c,(SELECT DISTINCT COUNT(*) count from ${req.body.pathogenSelection} where ${req.body.tableColumns} IN (${sbc})) a`
//         // console.log("***** Query *****",query_)
//     }
    
//     db.query(query_,function(err,rows,fields){
//         // console.log("*******ROWS",rows[0].count)
//         if(err){
//             console.log("Error",err);
//             return res.render('QueryPage',{
//                 rows:[],
//                 columns :[],
//                 message: "An error occurred in running query: " + err
//             })
//         }else{
//             try{
//                 if(rows.length!=0){
//                     var columnNames = Object.keys(rows[0]);
//                     var tableLength = rows[0].count
//                     columnNames.splice(0,1)
//                     let allFieldvals = rows.map(function(row){ return row[req.body.tableColumns] })
//                     // console.log(allFieldvals)
                    
//                     let allFieldValuesSet = new Set(allFieldvals)
//                     let sbcSet = new Set(req.body.searchByColumn)
//                     let valuesNotPresent = [...sbcSet].filter(x=>!allFieldValuesSet.has(x))
//                     if(valuesNotPresent.length && valuesNotPresent[0].length == 1){
//                         valuesNotPresent = []
//                     }
//                     queryResult = queryRaw;
//                     // console.log(queryResult);
//                     return res.render('QueryPage',{
//                     rows:rows,
//                     columns : columnNames,
//                     ColumnName: req.body.tableColumns,
//                     ColumnValues:sbc,
//                     valuesNotPresent:valuesNotPresent,
//                     TableLength:tableLength
//                     })

//                 }else{
//                     return res.render('QueryPage',{
//                         rows:[],
//                         columns :[],
//                         message: "No results found, kindly check filter parameters"
//                     })
//                 }
               
//             }catch(err){
//                 res.render('QueryPage',{
//                     rows:[],
//                     columns :[],
//                     message: "An error occurred in running query: " + err
//                 })
            
//             }
//         }
        
//     });
    
// };

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
    var format = /[ `!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?~]/;
    try{
        if((!format.test(pathogenTable))&(!format.test(column))){

            var query_ = `SELECT DISTINCT ${column} FROM ${pathogenTable}`

            var rows = await Cache.findOne({query: query_})
            if(rows!=null){
                rows = rows.content
            }
            else{
                rows = await db.promise().execute(query_);
                // console.log(rows)
                rows = rows[0].map(function(row){ return row[column] })
                await Cache.create({
                    query: query_,
                    content: rows
                });
                // console.log("query Rows",rows)
            }




            

            

            if(req.xhr){
                
                return res.status(200).json({
                    message: "Columns",
                    data: rows
            })
            }

        }else{
            return res.send('back')
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
