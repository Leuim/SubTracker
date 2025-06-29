const Transaction = require('../models/transaction')
const Subscription = require('../models/subscription')
const router = require('express').Router()

const updateBillingDateIfPaid = async (transaction) => {
  const subscription = await Subscription.findById(transaction.subscription)
  if (!subscription || subscription.status !== 'Active') {
    return
  }
  const next = new Date(subscription.nextBillingDate)
  if (subscription.billingCycle === 'Monthly') {
    next.setMonth(next.getMonth() + 1)
  } else if (subscription.billingCycle === 'Annual') {
    next.setFullYear(next.getFullYear() + 1)
  }
  subscription.nextBillingDate = next
  await subscription.save()
};

router.get('/', async (req, res) => {
  try {
    const userTransactions = await Transaction.find({ owner: req.session.user._id }).populate('owner').populate('subscription')
    res.render('transactions/index.ejs', { userTransactions })
  } catch (error) {
    console.log(error);
    res.redirect('/')
  }
})

router.get('/:transactionId', async (req, res) => {
  try {
    const currentTransaction = await Transaction.findById(req.params.transactionId).populate('subscription')
    res.render('transactions/show.ejs', { currentTransaction })
  } catch (error) {
    console.log(error);
    res.redirect('/')
  }
})

const toBoolean = (str) => {
  return str === 'True';
}

router.get('/:subscriptionId/new', async (req,res)=>{
  const currentSubscription = await Subscription.findById(req.params.subscriptionId)
  res.render('transactions/new.ejs', {currentSubscription})
})

router.post('/:subscriptionId', async (req, res) => {
  try {
    req.body.amount = Number(req.body.amount)
    req.body.owner = req.session.user._id
    req.body.subscription = req.params.subscriptionId
    req.body.paid = toBoolean(req.body.paid)
    const currentTransaction = await Transaction.create(req.body)
    updateBillingDateIfPaid(currentTransaction)
    res.redirect(`/subscriptions/${req.params.subscriptionId}`)
  } catch (error) {
    console.log(error);
    res.redirect('/')
  }
})

router.get('/:transactionId/edit', async (req, res) => {
  try {
    const currentTransaction = await Transaction.findById(req.params.transactionId).populate('subscription')
    res.render('transactions/edit.ejs', { currentTransaction })
  } catch (error) {
    console.log(error);
    res.redirect('/')
  }
})

router.put('/:transactionId', async (req, res) => {
  try {
    const currentTransaction = await Transaction.findById(req.params.transactionId)
    if (currentTransaction.owner.equals(req.session.user._id)) {
      req.body.amount = Number(req.body.amount)
      req.body.paid = toBoolean(req.body.paid)
      await Transaction.findByIdAndUpdate(currentTransaction._id, req.body)
      res.redirect(`/subscriptions/${currentTransaction.subscription}`)
    } else {

    }
  } catch (error) {
    console.log(error);
    res.redirect('/')
  }
})

router.delete('/:transactionId', async (req, res) => {
  try {
    const currentTransaction = await Transaction.findById(req.params.transactionId)
    if (currentTransaction.owner.equals(req.session.user._id)) {
      await Transaction.findByIdAndDelete(req.params.transactionId)
      res.redirect(`/subscriptions/${currentTransaction.subscription}`)
    } else {

    }
  } catch (error) {
    console.log(error);
    res.redirect('/')
  }
})
module.exports = router