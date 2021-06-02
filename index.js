const express = require('express');
var cluster = require( 'cluster' );
const session = require('express-session')
const port = 8000;
const compression = require('compression');
const expressLayouts = require('express-ejs-layouts'); 
const cachingDb = require('./config/mongoose');
const mongoose = require('mongoose')
const Cache = require('./models/cache');
const svgCaptcha = require('svg-captcha-express');
const MongoStore = require('connect-mongo');
const numCPUs = require('os').cpus().length;
const captchaUrl = '/captcha.jpg'

if (cluster.isMaster) {

    console.log(`Master ${process.pid} is running`);
  
    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
  
    cluster.on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
      cluster.fork(); // Create a New Worker, If Worker is Dead
    });
  
  }else{

    const app = express();

    app.use(compression());
    app.use(express.urlencoded({extended:true}));

    // app.use(cookieParser('imitateDB_development'))
    app.use(
        session({
            secret:'imitateDB_development',
            resave:false,
            saveUninitialized:true,
            cookie:{
                maxAge:10*60*1000
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




    app.get(captchaUrl, captcha.image());
    app.use('/',require('./routes'));


    app.listen(port,function(err){
        if(err){
            console.log("Error in starting server",port);
        }else{
            console.log("Server is running on port: ",port," with worker id:",cluster.worker.id," and process id",cluster.worker.process.pid);
        }


    });

}
