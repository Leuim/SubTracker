const mongoose = require('mongoose');

const subscriptionSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    billingCycle:{
        type:String,
        required:true,
        enum:['Monthly','Annual']
    },
    nextBillingDate:{
        type:Date,
        required:true,
    },
    category:{
        type:String
    },
    status:{
        type:String,
        required:true,
        enum:['Active','Paused','Canceled']
    },
    outstandingAmount:{
        type:Number
    },
    Notes:{
        type:String
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
})

const Subscription = mongoose.model('Subscreption', subscriptionSchema)
module.exports = Subscription