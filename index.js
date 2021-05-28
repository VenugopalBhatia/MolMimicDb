const express = require('express');
const session = require('express-session')
const port = 8000;
const compression = require('compression');
const app = express();
const expressLayouts = require('express-ejs-layouts'); 
const cachingDb = require('./config/mongoose');
const mongoose = require('mongoose')
const Cache = require('./models/cache');
const svgCaptcha = require('svg-captcha-express');
const MongoStore = require('connect-mongo');


const captchaUrl = '/captcha.jpg'

app.use(
    session({
        secret:'imitateDB_development',
        resave:false,
        saveUninitialized:true,
        cookie:{
            maxAge:2*60*1000
        },
        store: MongoStore.create({
            mongoUrl:'mongodb://localhost/cachingdb',
            autoRemove:'disabled',

        },function(err){
            console.log(err || "MongoStore connected to database")
        })

    })
)

const captcha = require('svg-captcha-express').create({
	cookie: 'captcha'
});


app.use(express.static('assets'));
app.use(expressLayouts);
app.set('layout extractStyles',true);
app.set('layout extractScripts',true);


app.set('view engine','ejs');
app.set('views','./views');


app.use(compression());
app.use(express.urlencoded({extended:true}));
app.get(captchaUrl, captcha.image());
app.use('/',require('./routes'));


app.listen(port,function(err){
    if(err){
        console.log("Error in starting server",port);
    }else{
        console.log("Server is running on port: ",port);
    }


});
