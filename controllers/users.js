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
            res.render('auth/signup.ejs', { title: 'Sign Up', error: 'User is already in the database.' })
        }
        if (req.body.password !== req.body.confirmPassword) {
            res.render('auth/signup.ejs', { title: 'Sign Up', error: 'Passwords do not match.' })
        }
        if (!validator.isEmail(req.body.email)) {
            res.render('auth/signup.ejs', { title: 'Sign Up', error: 'Please enter a valid email.' })
        }
        const hashedPassword = bcrypt.hashSync(req.body.password, 10)
        req.body.password = hashedPassword

        const user = await User.create(req.body)
        req.session.user = {
            username: user.username,
            email: user.email,
            _id: user._id
        }
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
            return res.render('auth/signin.ejs', { title: 'Sign In', error: 'Login failed please try again.' })
        }
        if (userInDatabase.email !== req.body.email) {
            return res.render('auth/signin.ejs', { title: 'Sign In', error: 'Login failed please try again.' })
        }
        const checkPassword = bcrypt.compareSync(req.body.password, userInDatabase.password)
        if (!checkPassword) {
            return res.render('auth/signin.ejs', { title: 'Sign In', error: 'Login failed please try again.' })
        }
        req.session.user = {
            username: userInDatabase.username,
            email:userInDatabase.email,
            _id: userInDatabase._id
        }

        res.redirect('/')
    } catch (error) {
        console.log(error);
        res.redirect('/')
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