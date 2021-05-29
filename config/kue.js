const kue = require('kue');


const queue = kue.createQueue();
// kue.app.listen(2000);
module.exports = queue;