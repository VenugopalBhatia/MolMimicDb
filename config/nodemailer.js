const nodemailer = require('nodemailer');
const path = require('path')
const ejs = require('ejs')
const env = require('./environment')

let transporter = nodemailer.createTransport(env.smtp)


let renderTemplate = function(data,relativePath){
    let mailHTML;
    ejs.renderFile(path.join(__dirname,'../views/mailer',relativePath),{data:data},function(err,template){
        if(err){
            console.log("Error in rendering email",err);
            return;
        }
        mailHTML = template;
    }
    )

    
    return mailHTML;

}





module.exports = {
    transporter:transporter,
    renderTemplate:renderTemplate
}