const express = require('express');
var cluster = require( 'cluster' );
const session = require('express-session')
const compression = require('compression');
const expressLayouts = require('express-ejs-layouts'); 
const cachingDb = require('./config/mongoose');
const mongoose = require('mongoose')
const Cache = require('./models/cache');
const svgCaptcha = require('svg-captcha-express');
const MongoStore = require('connect-mongo');
const numCPUs = require('os').cpus().length;
const captchaUrl = '/captcha.jpg'
const env = require('./config/environment')
const port = env.port
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
            secret: env.sessionCookieSecret,
            resave:false,
            saveUninitialized:true,
            cookie:{
                maxAge:10*60*1000
            },
            store: MongoStore.create({
                mongoUrl:`mongodb://localhost/${env.cachingdb}`,
                autoRemove:'disabled',

            },function(err){
                console.log(err || "MongoStore connected to database")
            })

        })
    )

    const captcha = require('svg-captcha-express').create(env.captcha);


    app.use(express.static(env.assets));
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
