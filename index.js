const express = require('express');
const port = 8000;
const compression = require('compression');
const app = express();
const expressLayouts = require('express-ejs-layouts'); 
const cachingDb = require('./config/mongoose');
const Cache = require('./models/cache');

app.use(express.static('assets'));
app.use(expressLayouts);
app.set('layout extractStyles',true);
app.set('layout extractScripts',true);


app.set('view engine','ejs');
app.set('views','./views')

app.use(compression());
app.use(express.urlencoded({extended:true}));

app.use('/',require('./routes'));


app.listen(port,function(err){
    if(err){
        console.log("Error in starting server",port);
    }else{
        console.log("Server is running on port: ",port);
    }


});
