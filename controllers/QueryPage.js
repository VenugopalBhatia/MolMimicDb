const express = require('express');
const superagent = require('superagent');
const db = require('../models/mimicDbConnector');
var  { Parser } = require('json2csv')
const Cache = require('../models/cache');
const queue = require('../config/kue');
const emailWorker = require('../workers/email_worker');
const emailResults = require('./mailer/emailResults');
const env = require('../config/environment')


// var queryResult = [];
// var query_result_count = 0;
// var query_details = {}

module.exports.getDomainForm = function(req,res){
    return res.render('queryForm_Domain')
}

module.exports.getMotifForm = function(req,res){
    return res.render('queryForm_Motif')
}

module.exports.getInterpretationPage = function(req,res){
    return res.render('interpretationofResults')
}

module.exports.getQueryPageOnLoad = function(req,res){
    req.session.queryResult = []
    req.session.query_result_count = 0
    req.session.query_details = {}
    res.locals.notification = "Welcome! get started by clicking the button on the right"
    res.locals.messageType = "success"
    if((req.session.ErrMessage) && (req.session.ErrMessage.length>0)){
        res.locals.notification = req.session.ErrMessage
        res.locals.messageType = 'error'
        req.session.ErrMessage = ""
        
    }
    if((req.session.SuccessMessage) && (req.session.SuccessMessage.length>0)){
        res.locals.notification = req.session.SuccessMessage
        res.locals.messageType = 'info'
        req.session.SuccessMessage = ""
    }
    return res.render('QueryPage',{
        rows:[],
        columns :[],
        message: "Welcome! get started by clicking the button on the right",
    })
}

var validateCaptcha =  async function(req,res){

    let captcha_validation_token = true
    // console.log("Request Body",req.body)
    if(req.session.captcha != req.body['captcha-val']){
        // console.log("actual captcha",req.session.captcha)
        // console.log("entered captcha",req.body['captcha-val'])
        // console.log(req.session.captcha != req.body['captcha-val'])
        captcha_validation_token =  false
    }else if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null){
        // console.log("request body problem")
        captcha_validation_token = false
    }else{

        var queryOptions = {
            secret: env.recaptchaSecret,
            response: req.body['g-recaptcha-response'],
            remoteip: req.connection.remoteAddress
            
        }
        const secretKey = env.recaptchaSecret;
    
        const verificationURL = "https://www.google.com/recaptcha/api/siteverify"
    
        const response = await superagent.get(verificationURL).query(queryOptions)
        // console.log(response.body)
    
        captcha_validation_token = response.body.success;

    }

    return captcha_validation_token

}

var checkSqlInjection = function(req,res){
    var format = /[`!@#$%^&*+=;<>?~]/;
    if((format.test(req.body.searchByColumn))||(format.test(req.body.tableColumns)||(format.test(req.body.pathogenSelection)))){
        return false;
    }
    return true;
}

var get_values_absent = async function(req,mongoQuery){
    let valuesNotPresent = []
    
    var allFieldValuesSet = await Cache.findOne({query: mongoQuery})
    if(allFieldValuesSet!=null){
        allFieldValuesSet = new Set(allFieldValuesSet.content)
        let sbcSet = new Set(req.body.searchByColumn)
        
        valuesNotPresent = [...sbcSet].filter(x=>!allFieldValuesSet.has(x)) // Check for user entered values not in db
        if(valuesNotPresent.length && valuesNotPresent[0].length == 1){
            valuesNotPresent = []
        }
    }

    return valuesNotPresent
}


module.exports.displayTables = async function(req,res){

    
    
    let captcha_validation_token = await validateCaptcha(req,res);
    

    // console.log("captcha_validation_token",captcha_validation_token)

    if(!captcha_validation_token){
        // console.log("captcha_validation_token",captcha_validation_token)
        res.locals.notification = 'Incorrect Captcha please try again'
        res.locals.messageType = 'error'
        return res.render('QueryPage',{
            rows:[],
            columns :[],
            message: "request blocked! possible bot detected"
        })
    }
    
    try{

        let check_sql_query = await checkSqlInjection(req,res);

        if(!check_sql_query){
            throw new Error('Possible sql injection detected')
        }

        req.session.queryResult = []
        req.session.query_result_count = 0
        req.session.query_details = {}
        
        let query_ = ""
        let queryRaw = ""
        if(req.body.searchByColumn == null || req.body.tableColumns == null){
            return res.render('QueryPage',{
                rows:[],
                columns :[],
                message: "Kindly add filter parameters",
                notification:"Check your filter parameters",
                messageType: 'warning'
            })

            // queryRaw = `SELECT DISTINCT * from ${req.body.pathogenSelection}`
            // query_ = `SELECT a.count , c.* from (${queryRaw} LIMIT 500) c,(SELECT DISTINCT COUNT(*) count from ${req.body.pathogenSelection}) a`
        }
        // console.log(req.body)
        var sbc = JSON.stringify(req.body.searchByColumn);
        sbc = sbc.replace(/^\[([\s\S]*)]$/,'$1');

        if((Array.isArray(req.body.searchByColumn))&(req.body.searchByColumn.length>10)){
            // console.log("req body values",req.body.searchByColumn)
            // console.log("sbc",sbc)
            // console.log("sbc length",sbc.length)
            throw Error('number of values entered greater than 10')
        }
            
        queryRaw = `SELECT distinct * from ${req.body.pathogenSelection} where ${req.body.tableColumns} IN (${sbc})`
        query_ = `SELECT a.count, c.* from (${queryRaw} LIMIT 500) c,(SELECT DISTINCT COUNT(*) count from ${req.body.pathogenSelection} where ${req.body.tableColumns} IN (${sbc})) a`
        var mongoQuery = `SELECT DISTINCT ${req.body.tableColumns} FROM ${req.body.pathogenSelection}`
        // console.log("***** Query *****",query_)
        
        var rows = await db.promise().query(query_)
        // console.log(query_)
        // console.log("rows ",rows)
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
            // let allFieldvals = rows.map(function(row){ return row[req.body.tableColumns] })
            // console.log(allFieldvals)
            let valuesNotPresent =  await get_values_absent(req,mongoQuery);
            // let allFieldValuesSet = new Set(allFieldvals)
            // rows = rows.slice(0,500)
            req.session.queryResult = queryRaw;
            req.session.query_result_count = tableLength;
            req.session.query_details['count'] = req.session.query_result_count
            req.session.query_details['filter_name'] = req.body.tableColumns.replace(/_/g," ")
            req.session.query_details['table_name'] = req.body.pathogenSelection.replace(/_/g," ")
            req.session.query_details['values_entered'] = sbc
            // console.log('query details',query_details)
            // console.log(req.body.tableColumns);
            res.locals.notification = 'Displaying results now'
            res.locals.messageType = 'info'
            if(tableLength>100000){
                res.locals.notification = 'Query yields too broad results! Download unavailable'
                res.locals.messageType = 'alert'
            }
            
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
            res.locals.notification = "No results found, kindly check filter parameters",
            res.locals.messageType = 'error'
            return res.render('QueryPage',{
                rows:[],
                columns :[],
                message: "No results found, kindly check filter parameters",
                
            })
        }

    }catch(err){
        console.log(err);
        console.log("Column Values",req.body.searchByColumn)
        console.log("Table values",req.body.tableColumns)
        res.render('QueryPage',{
            rows:[],
            columns :[],
            message: "An error occurred in running query: " + err,
            notification:'An error occured, please try again',
            messageType:"error"
        })

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
                // await queryDoc.save()
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

// csv file download
// if query rows > 100000 excel download disabled
// if query rows< 10000 excel download attachment sent
// if query rows >10000 return a form for user email
// the queue job and email attachment

module.exports.sendCSVResult = async function(req,res){
    if(req.session.queryResult.length && req.session.query_result_count>10000 && req.session.query_result_count<=100000){
        try{
            // console.log("Request body",req.body)
            req.session.query_details['name'] = req.body.name;
            let processParams = {}
            processParams['query_details'] = req.session.query_details
            processParams['queryResult'] = req.session.queryResult
            processParams['email'] = req.body.email
            let job = queue.create('emails',processParams).priority('medium').save(function(err){
                if(err){
                    console.log("Error in adding job to queue",err)
                    return;
                }
                // console.log("email job queued,job id:",job.id)
            })
            
            
            var message = `Hey ${req.body.name} an email will be sent to ${req.body.email} with the requested data.`
            req.session.SuccessMessage = message
            return res.redirect('back');


        }catch(err){
            req.session.ErrMessage = 'An error occurred, please try again'
            console.log("An error occurred in queueing email",err)
            return res.redirect('/')
        }

    }else{
        console.log("query result length",req.session.queryResult)
        console.log("query_result_count",req.session.query_result_count)
        return res.redirect('back');
    }
}


module.exports.queryCSVResult = async function(req,res){
    
    if(req.session.queryResult.length && req.session.query_result_count>0 && req.session.query_result_count<=10000){
        try{
            var rows = await db.promise().query(req.session.queryResult)
            rows = rows[0]
            const json2csv = new Parser();
            const csv = json2csv.parse(rows);
            
            res.attachment('data.csv')
            res.status(200).send(csv)

        }catch(err){
            // req.flash('error','Error in data download, please try again')
            console.log("Error in data download",err)
            return res.redirect('back');

        }
    }else{
        return res.redirect('back');
    }
    
    

        
    
}

// module.exports.queryCSVResult = async function(req,res){
//     // console.log("**** get request")
//     // return emailResults.sendCSVAsAttachment(query_details,queryResult);
//     if(queryResult.length && query_result_count<10000){
//         db.query(queryResult,function(err,rows,fields){
//             if(err){
//                 if(req.xhr){
//                     console.log("error")
//                     return res.status(500).json({
//                         message:err
//                     })
//                 }
//                 console.log("Error:",err)
//                 console.log(queryResult)
//             }else{
//                 try{
                    
//                     if(req.xhr){
                        
//                         if(rows.length!=0){
//                             return res.status(200).json({
//                                 message: "The following data was returned by the database",
//                                 data:rows
//                             })

//                         }else{
//                             console.log("error")
//                             return res.status(404).json({
//                                 message: "There was a problem with the query, pls check"
//                             })
//                         }
                        
//                     }

//                     const json2csv = new Parser()

//                     try{
//                         const csv = json2csv.parse(rows)
//                         // console.log("parsed data")
//                         res.attachment('data.csv')
//                         res.status(200).send(csv)
//                     }
//                     catch(error){
//                         console.log('error:', error.message)
//                         res.status(500).send(error.message)
//                     }
//                 }
//                 catch(ReturnDataErr){
//                     console.log("Error in returning data",ReturnDataErr)

//                 }
                
                
//             }
//         })
//     }else{
//         return res.redirect('back');
//     }
// }



