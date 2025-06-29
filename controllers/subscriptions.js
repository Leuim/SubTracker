const Subscription = require('../models/subscription');
const Transaction = require('../models/transaction')
const router = require('express').Router()
const validator = require('validator');

const countOutstandingAmount = (transactions) => {
    let outstandingAmount = 0
    transactions.forEach(transaction => {
        if (!transaction.paid) {
            outstandingAmount = transaction.amount + outstandingAmount
        }
    })
    return outstandingAmount
}

router.get('/', async (req, res) => {
    try {
        const userSubscriptions = await Subscription.find({ owner: req.session.user._id }).populate('owner')
        res.render('subscriptions/index.ejs', { userSubscriptions })
    } catch (error) {
        console.log(error);
        res.redirect('/')
    }
})

router.get('/new', async (req, res) => {
    res.render('subscriptions/new.ejs')
})

router.post('/', async (req, res) => {
    try {
        if (!validator.isAlpha(req.body.name)) {
            req.flash('error', 'Invalid Name. Name only contain letters.')
            return res.redirect('/subscriptions/new')
        }
        if (req.body.amount <= 0) {
            req.flash('error', 'Invalid Amount. Amount must be a positive number.')
            return res.redirect('/subscriptions/new')
        }
        const dateNow = new Date()
        dateNow.setHours(0, 0, 0, 0)
        const dateInput = new Date(req.body.nextBillingDate)
        if (dateInput < dateNow) {
            req.flash('error', 'Invalid next billing date. it must come after current date.')
            return res.redirect('/subscriptions/new')
        }
        req.body.owner = req.session.user._id
        req.body.outstandingAmount = 0
        await Subscription.create(req.body)
        req.flash('success', 'Subscription created successfully.')
        res.redirect('/subscriptions')
    } catch (error) {
        console.log(error);
        res.redirect('/')
    }
})

router.get('/:subscriptionId', async (req, res) => {
    try {
        const currentSubscription = await Subscription.findById(req.params.subscriptionId).populate('owner')
        const subscriptionTransactions = await Transaction.find({ subscription: currentSubscription._id })
        if (currentSubscription.owner.equals(req.session.user._id)) {
            currentSubscription.outstandingAmount = countOutstandingAmount(subscriptionTransactions)
            await currentSubscription.save()
            res.render('subscriptions/show.ejs', { currentSubscription, subscriptionTransactions })
        } else {
            req.flash('error', 'You dont have permission to do that.')
            res.redirect('/')
        }
    } catch (error) {
        console.log(error);
        res.redirect('/')
    }
})

router.get('/:subscriptionId/edit', async (req, res) => {
    try {
        const currentSubscription = await Subscription.findById(req.params.subscriptionId).populate('owner')
        if (currentSubscription.owner.equals(req.session.user._id)) {
        res.render('subscriptions/edit.ejs', { currentSubscription })
         } else {
            req.flash('error', 'You dont have permission to do that.')
            res.redirect('/')
        }
    } catch (error) {
        console.log(error);
        res.redirect('/')
    }
})


router.put('/:subscriptionId', async (req, res) => {
    try {
        const currentSubscription = await Subscription.findById(req.params.subscriptionId)
        if (currentSubscription.owner.equals(req.session.user._id)) {
            if (!validator.isAlpha(req.body.name)) {
                req.flash('error', 'Invalid Name. Name only contain letters.')
                return res.redirect(`/subscriptions/${currentSubscription._id}/edit`)
            }
            if (req.body.amount <= 0) {
                req.flash('error', 'Invalid Amount. Amount must be a positive number.')
                return res.redirect(`/subscriptions/${currentSubscription._id}/edit`)
            }
            const dateNow = new Date()
            dateNow.setHours(0, 0, 0, 0)
            const dateInput = new Date(req.body.nextBillingDate)
            if (dateInput < dateNow) {
                req.flash('error', 'Invalid next billing date. it must come after current date.')
                return res.redirect(`/subscriptions/${currentSubscription._id}/edit`)
            }
            await Subscription.findByIdAndUpdate(req.params.subscriptionId, req.body)
            res.redirect(`/subscriptions/${currentSubscription._id}`)
        } else {
            req.flash('error', 'You dont have permission to do that.')
            res.redirect('/')
        }
    } catch (error) {
        console.log(error);
        res.redirect('/')
    }
})

router.delete('/:subscriptionId', async (req, res) => {
    try {
        const currentSubscription = await Subscription.findById(req.params.subscriptionId)
        if (currentSubscription.owner.equals(req.session.user._id)) {
            await Transaction.deleteMany({ subscription: currentSubscription._id });
            await Subscription.findByIdAndDelete(req.params.subscriptionId)
            res.redirect('/subscriptions')
        } else {
            req.flash('error', 'You dont have permission to do that.')
            res.redirect('/')
        }
    } catch (error) {
        console.log(error);
        res.redirect('/')
    }
})


module.exports = router