const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min:0
    },
    billingCycle: {
        type: String,
        required: true,
        enum: ['Monthly', 'Annual']
    },
    nextBillingDate: {
        type: Date,
        required: true,
    },
    category: {
        type: String,
        enum: [
            'Streaming',
            'Utilities',
            'Productivity',
            'Education',
            'Gaming',
            'Cloud/Storage',
            'Shopping',
            'Fitness/Health',
            'Finance',
            'Other'
        ],
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Active', 'Paused', 'Canceled']
    },
    outstandingAmount: {
        type: Number,
        default:0
    },
    notes: {
        type: String
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})

const Subscription = mongoose.model('Subscription', subscriptionSchema)
module.exports = Subscription