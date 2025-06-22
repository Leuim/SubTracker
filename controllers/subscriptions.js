const Subscription = require('../models/subscription');
const router = require('express').Router()

router.get('/', async (req, res) => {
    try {
        const userSubscriptions = await Subscription.find({ owner: req.session.user._id }).populate('owner')
        res.render('subscriptions/index.ejs', { title: 'Subscriptions', userSubscriptions })
    } catch (error) {
        console.log(error);
        res.redirect('/')
    }
})

router.get('/new', async (req, res) => {
    res.render('subscriptions/new.ejs', { title: 'New Subscription' })
})

router.post('/', async (req, res) => {
    try {
        req.body.owner = req.session.user._id
        req.body.outstandingAmount = 0
        await Subscription.create(req.body)
        res.redirect('/subscriptions')
    } catch (error) {
        console.log(error);
        res.redirect('/')
    }
})

router.get('/:subscriptionId', async (req, res) => {
    try {
        const subscriptionInDatabase = await Subscription.findById(req.params.subscriptionId).populate('owner')
        res.render('subscriptions/show.ejs', {title:subscriptionInDatabase.name, subscriptionInDatabase})
    } catch (error) {
        console.log(error);
        res.redirect('/')
    }
})

module.exports = router