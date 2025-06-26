const Transaction = require('../models/transaction')
const Subscription = require('../models/subscription')
const router = require('express').Router()

router.get('/', async (req,res)=>{
  try{
    const userTransactions = await Transaction.find({owner:req.session.user._id}).populate('owner').populate('subscription')
    res.render('transactions/index.ejs', {title:'Transactions',userTransactions})
  } catch (error){
    console.log(error);
    res.redirect('/')
  }
})

router.get('/:transactionId', async (req,res)=>{
    try{
        const currentTransaction = await Transaction.findById(req.params.transactionId).populate('subscription')
        res.render('transactions/show.ejs', {title:'Current Transactions', currentTransaction})
    } catch(error){
        console.log(error);
        res.redirect('/',{title:'Transactions'})
    }
})

const updateBillingDateIfPaid = async (transaction) => {
    if (!transaction.status) {
        return
    }
    const subscription = await Subscription.findById(transaction.subscription)
    if (!subscription || subscription.status !== 'active'){
        return
    } 
    const next = new Date(subscription.nextBillingDate)
    if (subscription.billingCycle === 'monthly') {
      next.setMonth(next.getMonth() + 1)
    } else if (subscription.billingCycle === 'yearly') {
      next.setFullYear(next.getFullYear() + 1)
    }
    subscription.nextBillingDate = next
    await subscription.save()
  };

const toBoolean = (str) => {
    return str === 'True';
  }

router.post('/:subscriptionId', async (req,res)=>{
    try{
    const currentSubscription = await Transaction.findById(req.params.subscriptionId)
    req.body.amount = Number(req.body.amount)
    req.body.owner = req.session.user._id
    req.body.subscription = req.params.subscriptionId
    req.body.paid = toBoolean(req.body.paid)
    console.log(req.body);
    const currentTransaction = await Transaction.create(req.body)
    updateBillingDateIfPaid(currentTransaction)
    res.redirect(`/subscriptions/${req.params.subscriptionId}`)
    } catch(error){
        console.log(error);
        res.redirect('/')
    }
})

router.get('/:transactionId/edit', async (req,res)=>{
  try{
    const currentTransaction = await Transaction.findById(req.params.transactionId).populate('subscription')
    res.render('transactions/edit.ejs',{currentTransaction, title:'Edit Transaction'})
  } catch(error){
    console.log(error);
    res.redirect('/')
  }
})

module.exports = router