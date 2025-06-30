const Transaction = require('../models/transaction')
const Subscription = require('../models/subscription')
const router = require('express').Router()

const updateBillingDateIfPaid = async (transaction) => {
  const subscription = await Subscription.findById(transaction.subscription)
  if (!transaction.paid || !subscription || subscription.status !== 'Active') {
    return
  }
  const paidDate = new Date(transaction.datePaid);
  const nextBillingDate = new Date(subscription.nextBillingDate)
  if (paidDate >= nextBillingDate) {
    const next = new Date(subscription.nextBillingDate)
    if (subscription.billingCycle === 'Monthly') {
      next.setMonth(next.getMonth() + 1)
    } else if (subscription.billingCycle === 'Annual') {
      next.setFullYear(next.getFullYear() + 1)
    }
    subscription.nextBillingDate = next
    await subscription.save()
  }
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

const toBoolean = (str) => {
  return str === 'True';
}

router.get('/:subscriptionId/new', async (req, res) => {
  const currentSubscription = await Subscription.findById(req.params.subscriptionId)
  res.render('transactions/new.ejs', { currentSubscription })
})

router.post('/:subscriptionId', async (req, res) => {
  try {
    if (req.body.amount <= 0) {
      req.flash('error', 'Invalid Amount. Amount must be a positive number.')
      return res.redirect(`/transactions/${req.params.subscriptionId}/new`)
    }
    if (toBoolean(req.body.paid) && !req.body.datePaid) {
      req.flash('error', 'Date Paid must be filled if the transaction has been paid.')
      return res.redirect(`/transactions/${req.params.subscriptionId}/new`)
    }
    req.body.amount = Number(req.body.amount)
    req.body.owner = req.session.user._id
    req.body.subscription = req.params.subscriptionId
    req.body.paid = toBoolean(req.body.paid)

    const currentTransaction = await Transaction.create(req.body)
    updateBillingDateIfPaid(currentTransaction)
    req.flash('success', 'A New Transaction Has Been Created!')
    res.redirect(`/subscriptions/${req.params.subscriptionId}`)
  } catch (error) {
    console.log(error);
    res.redirect('/')
  }
})

router.get('/:transactionId/edit', async (req, res) => {
  try {
    const currentTransaction = await Transaction.findById(req.params.transactionId).populate('subscription')
    if (currentTransaction.owner.equals(req.session.user._id)) {
      res.render('transactions/edit.ejs', { currentTransaction })
    } else {
      req.flash('error', 'You do not have permission to do that.')
      res.redirect('/')
    }
  } catch (error) {
    console.log(error);
    res.redirect('/')
  }
})

router.put('/:transactionId', async (req, res) => {
  try {
    const currentTransaction = await Transaction.findById(req.params.transactionId)
    if (currentTransaction.owner.equals(req.session.user._id)) {
      if (req.body.amount <= 0) {
        req.flash('error', 'Invalid Amount. Amount must be a positive number.')
        return res.redirect(`/transactions/${req.params.transactionId}/edit`)
      }
      if (toBoolean(req.body.paid) && !req.body.datePaid) {
        req.flash('error', 'Date Paid must be filled if the transaction has been paid.')
        return res.redirect(`/transactions/${req.params.transactionId}/edit`)
      }
      req.body.amount = Number(req.body.amount)
      req.body.paid = toBoolean(req.body.paid)

      const updatedTransaction = await Transaction.findByIdAndUpdate(currentTransaction._id, req.body)
      updateBillingDateIfPaid(updatedTransaction)
      req.flash('success', 'A Transaction Has Been Edited!')
      res.redirect(`/subscriptions/${updatedTransaction.subscription}`)
    } else {
      req.flash('error', 'You do not have permission to do that.')
      res.redirect('/')
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
      req.flash('success','Transaction has been deleted successfully.')
      res.redirect(`/subscriptions/${currentTransaction.subscription}`)
    } else {
      req.flash('error','You do not have permission to do that.')
      res.redirect('/')
    }
  } catch (error) {
    console.log(error);
    res.redirect('/')
  }
})
module.exports = router