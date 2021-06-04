const nodemailer = require('../../config/nodemailer');
var  { Parser } = require('json2csv')
const db = require('../../models/mimicDbConnector');


exports.sendCSVAsAttachment = async function(query_details,queryResult,user_email){

    try{

        var csv = await getCSVData(queryResult,query_details['count']);
        var HTMLString = nodemailer.renderTemplate(query_details,'/emailCSVData.ejs')
        nodemailer.transporter.sendMail({
            from: '"The ImitateDB Team" dbimitate@gmail.com',
            to: user_email,
            subject: 'The Data you requested from Imitate Db',
            html:HTMLString,
            attachments:[
                {
                    filename:'data.csv',
                    content:csv
                }
            ]
        })
    }catch(err){

        console.log("The following error occurred",err);
        return;
    }

}


let getCSVData = async function(queryResult,query_result_count){
    if(queryResult.length && query_result_count<100000){
        try{
            var rows = await db.promise().query(queryResult);
            rows = rows[0]
            const json2csv = new Parser();
            return json2csv.parse(rows);
            
        }
        catch(err){
            console.log("An error occurred",err)
            return;
        }
        
    }else{
        console.log("query missing or query rows greater than 100000")
        console.log("queryResult",queryResult);
        console.log("queryResult length",queryResult.length);
        console.log("query result count",query_result_count);
    }

}