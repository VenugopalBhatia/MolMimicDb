const express = require('express');
const port = 8000;

const app = express();
const expressLayouts = require('express-ejs-layouts'); 

app.use(express.static('assets'));
app.use(expressLayouts);
app.set('layout extractStyles',true);
app.set('layout extractScripts',true);


app.set('view engine','ejs');
app.set('views','./views')

app.use(express.urlencoded({extended:true}));

app.use('/',require('./routes'));


app.listen(port,function(err){
    if(err){
        console.log("Error in starting server",port);
    }else{
        console.log("Server is running on port: ",port);
    }


});
