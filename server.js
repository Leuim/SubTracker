const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const app = express();

const methodOverride = require('method-override');
const morgan = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');

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

// DB connection

mongoose.connect(process.env.MONGODB_URI)

mongoose.connection.on('connected', ()=>{
    console.log(`Connected to: ${mongoose.connection.name}`);
})

//Controllers
const authCtrl = require('./controllers/user');
app.use('/auth', authCtrl);

app.get('/', async (req,res)=>{
    res.render('index.ejs');
})

app.listen(PORT,()=>{
    console.log(`Listening on port: ${PORT}`);
})