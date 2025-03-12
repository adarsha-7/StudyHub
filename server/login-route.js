const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const path = require('path')
require('dotenv').config()
const nodemailer = require('nodemailer')
const User = require('../models/user')

let otp;

const authenticateToken = function(req, res, next) {
    const verifiedToken = req.cookies.verifiedToken
    if (!verifiedToken) return res.status(200).send('Error: Access Denied');
    else {
        jwt.verify(verifiedToken, process.env.VERIFIED_TOKEN_SECRET, (err, user) => {
            if (err) return res.status(403).json(err)
            next()
        })
    }
}

router.get('/sendmail', (req, res) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        secure: true,
        port: 465,
        auth: {
            user: "studyhub552@gmail.com",
            pass: "qdwt cnwi badi pjok"
        }
    })

    otp = generateOTP()
    setInterval(() => {otp = generateOTP()}, 60000)
    const mailOptions = {
        from: "studyhub552@gmail.com",
        to: req.query.email,
        subject: "StudyHub login OTP",
        text:  `Your login OTP for StudyHub is ${otp} \nIf you did not attempt to sign in, you can safely ignore this email.`
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if(error) {
            console.log(error)
            return res.status(500).send({error})
        }
        else {
            res.redirect(`/login/otp?email=${req.query.email}`)
        }
    })
})

router.get('/otp', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/otp.html'));
})

const generateOTP = function() { return Math.floor(Math.random() * 1000000) }

router.get('/verify', async (req, res) => {
    if (req.query.otp == otp) {
        const Payload = {verified: true}
        const verifiedToken = jwt.sign(Payload, process.env.VERIFIED_TOKEN_SECRET, {expiresIn: '10s'})
        res.cookie('verifiedToken', verifiedToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 10 * 1000
        })

        const user = await User.findOne({email: req.query.email})
        if(!user) {
            res.status(200).redirect(`/login/new-account?email=${req.query.email}`)
        }
        else {
            res.status(200).redirect(`/login/verification-success?email=${req.query.email}`)
        }
    }
    else {
        res.status(200).redirect(`/login/login?verification=fail`)
    }
})

router.get('/new-account', authenticateToken, (req, res) => {
    res.status(200).sendFile(path.join(__dirname, '../public/new-account.html'));
})

router.get('/verification-success', authenticateToken, (req, res) => {
    res.status(200).sendFile(path.join(__dirname, '../public/verification-success.html'));
})

router.post('/create', authenticateToken, async (req, res) => {
    try {
        const email = req.body.email
        const newUser = await User.create({email: email})
        res.status(200).redirect(`/login/verification-success?email=${email}`)
    }
    catch(err) {
        console.log(err)
        res.status(500).send(err)
    }
})

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
})

module.exports = router