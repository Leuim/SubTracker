const Transaction = require('../models/transaction')
const router = require('express').Router()

router.get('/', async (req,res)=>{
    try{
        res.render('transactions/index.ejs')
    } catch(error){
        console.log(error);
        res.redirect('/',{title:'Transactions'})
    }
})

module.exports = router