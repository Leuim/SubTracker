const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const app = express();

const methodOverride = require('method-override');
const morgan = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const connectFlash = require('connect-flash');
const isSignedIn = require('./middlewares/isSignedIn');
const passUserToView = require('./middlewares/passUserToView');
const passCurrentPathToView = require('./middlewares/passCurrentPathToView')
const passFlashMessageToView = require('./middlewares/passFlashMessageToView');
const path = require('path')
const PORT = process.env.PORT ? process.env.PORT : "3000";

//middle wares
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
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
app.use(passCurrentPathToView)
app.use(connectFlash())
app.use(passFlashMessageToView)
// DB connection

mongoose.connect(process.env.MONGODB_URI)

mongoose.connection.on('connected', ()=>{
    console.log(`Connected to: ${mongoose.connection.name}`);
})

//Controllers
const authCtrl = require('./controllers/users');
const subcriptionsCtrl = require('./controllers/subscriptions')
const transactionCtrl = require('./controllers/transactions');
app.use('/auth', authCtrl);
app.use('/subscriptions', isSignedIn, subcriptionsCtrl)
app.use(`/transactions`, isSignedIn, transactionCtrl)
app.get('/', async (req,res)=>{
    res.render('index.ejs');
})

app.listen(PORT,()=>{
    console.log(`Listening on port: ${PORT}`);
})