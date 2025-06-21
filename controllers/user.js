const User = require('../models/user');
const router = require('express').Router();
const bcrypt = require('bcrypt');
const validator = require('validator');

router.get('/sign-up', async (req, res) => {
    res.render('auth/signup.ejs');
});

router.post('/sign-up', async (req, res) => {
    try {
        const userInDatabase = await User.findOne({ username: req.body.username });
        if (userInDatabase) {
            return res.send('User is in the database already')
        }
        if (!req.body.password === req.body.confirmPassword) {
            return res.send('Passwords Dont match!')
        }
        if (!validator.isEmail(req.body.email)) {
            return res.send('Not a valid email!')
        }
        const hashedPassword = bcrypt.hashSync(req.body.password, 10)
        req.body.password = hashedPassword

        const user = await User.create(req.body)
        req.session.userId = user._id;
        res.redirect('/')
    } catch (error) {
        console.log(error);
        res.send('Error')
    }
});

module.exports = router;