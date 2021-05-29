const queue = require('../config/kue');

const emailResults = require('../controllers/mailer/emailResults');

queue.process('emails',function(job,done){
    var processParams = job.data;
    let query_details = processParams['query_details']
    let queryResult = processParams['queryResult']
    let email = processParams['email']
    emailResults.sendCSVAsAttachment(query_details,queryResult,email);
    
    done();
})