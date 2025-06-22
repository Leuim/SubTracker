const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const app = express();

const methodOverride = require('method-override');
const morgan = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const isSignedIn = require('./middlewares/isSignedIn');
const passUserToView = require('./middlewares/passUserToView');
const PORT = process.env.PORT ? process.env.PORT : "3000";

//middle wares
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(morgan('dev'));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', './layouts/layout');
app.use(passUserToView)

// DB connection

mongoose.connect(process.env.MONGODB_URI)

mongoose.connection.on('connected', ()=>{
    console.log(`Connected to: ${mongoose.connection.name}`);
})

//Controllers
const authCtrl = require('./controllers/users');
const subcriptionsCtrl = require('./controllers/subscriptions')
app.use('/auth', authCtrl);
app.use('/subscriptions', isSignedIn, subcriptionsCtrl)
app.get('/', async (req,res)=>{
    res.render('index.ejs', {title:'SubTracker'});
})

app.listen(PORT,()=>{
    console.log(`Listening on port: ${PORT}`);
})