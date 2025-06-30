const User = require('../models/user');
const router = require('express').Router();
const bcrypt = require('bcrypt');
const validator = require('validator');

router.get('/sign-up', async (req, res) => {
    res.render('auth/signup.ejs', { title: 'Sign Up', error: null });
});

router.post('/sign-up', async (req, res) => {
    try {
        const userInDatabase = await User.findOne({ username: req.body.username });
        if (userInDatabase) {
            req.flash('error','User already in the database!')
            return res.redirect('/auth/sign-up')
        }
        if (req.body.password !== req.body.confirmPassword) {
            req.flash('error','Passwords do not match!')
            return res.redirect('/auth/sign-up')
        }
        if (!validator.isEmail(req.body.email)) {
            req.flash('error','Not a valid email!')
            return res.redirect('/auth/sign-up')
        }
        const hashedPassword = bcrypt.hashSync(req.body.password, 10)
        req.body.password = hashedPassword

        const user = await User.create(req.body)
        req.session.user = {
            username: user.username,
            email: user.email,
            _id: user._id
        }
        req.flash('success','Sign-up successfully!')
        res.redirect('/')
    } catch (error) {
        console.log(error)
        res.send('Error')
    }
});

router.get('/sign-in', async (req, res) => {
    res.render('auth/signin.ejs', { title: 'Sign In', error: null })
})


router.post('/sign-in', async (req, res) => {
    try {
        const userInDatabase = await User.findOne({ username: req.body.username })
        if (!userInDatabase) {
            req.flash('error','Login failed please try again.')
            return res.redirect('/auth/sign-in')
        }
        if (userInDatabase.email !== req.body.email) {
            req.flash('error','Login failed please try again.')
            return res.redirect('/auth/sign-in')
        }
        const checkPassword = bcrypt.compareSync(req.body.password, userInDatabase.password)
        if (!checkPassword) {
            req.flash('error','Login failed please try again.')
            return res.redirect('/auth/sign-in')
        }
        req.session.user = {
            username: userInDatabase.username,
            email:userInDatabase.email,
            _id: userInDatabase._id
        }
        req.flash('success','Signed in successfully!')
        return res.redirect('/')
    } catch (error) {
        console.log(error);
        return res.redirect('/')
    }
})

router.get('/sign-out', async (req,res)=>{
    try{
        req.session.destroy()
        res.redirect('/')
    }catch(error){
        console.log(error);
        res.redirect('/')
    }
})
module.exports = router;