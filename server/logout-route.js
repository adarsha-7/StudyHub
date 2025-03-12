const express = require('express')
const router = express.Router()
require('dotenv').config()
const User = require('../models/user')

router.delete('/', (req, res) => {
    const accessToken = req.cookies.accessToken
    const refreshToken = req.cookies.refreshToken

    if(!accessToken || !refreshToken) return res.status(400).json({msg: "Token(s) missing"})
    
    res.cookie('accessToken', '', {
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: new Date(0) 
    });
    res.cookie('refreshToken', '', {
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: new Date(0) 
    });
    return res.status(200).json({redirectUrl: `/login`})
})

module.exports = router