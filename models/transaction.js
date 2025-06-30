const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    amount:{
        type:Number,
        required:true
    },
    datePaid:{
        type:Date
    },
    paid:{
        type:Boolean,
        required:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    subscription:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Subscription'
    }

})

const Transaction = mongoose.model('Transaction', transactionSchema)
module.exports = Transaction