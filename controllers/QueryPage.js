const express = require('express')
const db = require('../models/mimicDbConnector');


module.exports.displayTables = function(req,res){
    db.query("SELECT * from bacteria_domainpair",function(err,rows,fields){
        if(err){
            console.log("Error",err);
        }else{
            
            var columnNames = Object.keys(rows[0]);
            res.render('QueryPage',{
                rows:rows,
                columns : columnNames
            })
        }
    });
    
};
