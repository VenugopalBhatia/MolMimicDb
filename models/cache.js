const mongoose =  require('mongoose');

const cachingSchema = mongoose.Schema({
    content:{
        type:Object
    },
    query:{
        type:String
    }
},{
    timestamps:true
})


const cache = mongoose.model('Cache',cachingSchema);

module.exports = cache;