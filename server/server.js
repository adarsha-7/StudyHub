const fs = require('fs');
const express = require('express');
const cookieParser = require('cookie-parser')
const path = require('path');

const app = express();

app.use('/styles', express.static(path.join(__dirname, '../public/styles')));
app.use('/scripts', express.static(path.join(__dirname, '../public/scripts')));;
app.use('/images', express.static(path.join(__dirname, '../images')));

app.use(express.json());
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())

//default route
const def = require('./default-route')
app.use('/', def)

//login route
const login = require('./login-route')
app.use('/login', login)

//token route
const token = require('./token-route')
app.use('/token', token)

//home route
const home = require('./home-route')
app.use('/home', home)

//discussion route
const discussion = require('./discussion-route')
app.use('/discussion', discussion)

//logout route
const logout = require('./logout-route')
app.use('/logout', logout)

const connectDB = require('../db/connect') 
require('dotenv').config() 

//First connecting with DB, then starting the Express server
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI) 
    app.listen(5000, () => {
      console.log('Server is running on http://localhost:5000')
    })
  } catch (err) {
    console.log(err)
  }
}
start()