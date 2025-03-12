const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const path = require('path')
require('dotenv').config()
const User = require('../models/user')

const authenticateToken = function(req, res, next) {
    const accessToken = req.cookies.accessToken
    if (!accessToken) return res.status(403).json({error: "Access Denied", msg: "Access Token not found"})
    else {
        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) return res.status(403).json(err)
            req.email = user.email
            next()
        })
    }
}

router.get('/personal-details', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/user-details.html'))
})

router.post('/personal-details', authenticateToken, async (req, res) => {
    const user = await User.findOneAndUpdate(
        {email: req.email},
        {$set: {
            f_name: req.body.fname, 
            l_name: req.body.lname,
            course: req.body.course,
            batch: req.body.batch
        }},
        {new: true}
    )
    console.log("User data updated successfully:", user)
    res.send(user)
})

router.get('/user-data', authenticateToken, async (req, res) => {
    const user = await User.findOne( {email: req.email })
    res.json({
        fname: user.f_name,
        lname: user.l_name,
        course: user.course,
        batch: user.batch
    })
})


router.get('/discussion', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/discussion.html'))
})

router.get('/home', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/dashboard.html'))
})

router.get('/faculties', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/faculties.html'))
})

router.get('/contact', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/contact.html'))
})

module.exports = router