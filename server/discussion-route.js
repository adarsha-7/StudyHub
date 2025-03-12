const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const path = require('path')
require('dotenv').config()
const User = require('../models/user')
const Question = require('../models/question')
const Answer = require('../models/answer')

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

//answer page
router.get('/answer', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/discussion.html'))
})

//ask list
router.get('/ask', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/ask.html'))
})

router.get('/get-questions', authenticateToken, async (req, res) => {
    let page = parseInt(req.query.page) || 1
    let limit = 10
    let skip = (page-1) * 10

    try {
        const questions = await Question.find()
            .sort({created: -1})
            .skip(skip)
            .limit(limit)
        res.json(questions)
    } 
    catch (err) { res.status(500).json(err) }
})

router.get('/get-your-questions', authenticateToken, async (req, res) => {
    
    let page = parseInt(req.query.page) || 1
    let limit = 10
    let skip = (page-1) * 10

    try {
        const user = await User.findOne({email: req.email})
        
        if(user.questions.length == 0) return res.json([])
        const questionIDs = user.questions
        let questions = []
        for (let i = 0; i < questionIDs.length; i++) {
            questions[i] = (await Question.findOne({id: questionIDs[i]}) )
        }
        questions.sort((a, b) => new Date(b.created) - new Date(a.created));

        questions = questions.slice(skip, skip+limit)
        res.json(questions)
    } 
    catch (err) { console.log(err); res.status(500).json(err) }
})

function RandomString() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 16; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    return result;
}

router.post('/add-question', authenticateToken, async (req, res) => {
    const questionID = RandomString()
    try {
        const question = await Question.create({
            title: req.body.title,
            value: req.body.value,
            id: questionID,
            poster: req.email
        })
        const user = await User.findOneAndUpdate(
            { email: req.email }, 
            { $push: { questions: questionID } },
            { new: true } 
        );        
        res.status(201).json({user, question})
    }
    catch (err) {
        console.error(err); 
        res.status(500).json({ Error: err });
    }
})

router.post('/add-answer', authenticateToken, async (req, res) => {
    const answerID = RandomString()
    try {
        const answer = await Answer.create({
            value: req.body.value,
            id: answerID,
            poster: req.email,
            question: req.body.questionID
        });
        const question = await Question.findOneAndUpdate(
            { id: req.body.questionID },
            { $push: { answers: answerID } },
            { new: true }
        );
        const user = await User.findOneAndUpdate(
            { email: req.email }, 
            { $push: { answers: answerID } },
            { new: true } 
        );     
        res.status(201).json({user, answer})
    }
    catch (err) {
        console.error(err); 
        res.status(500).json({ Error: err });
    }
})

router.get('/get-a-for-q',authenticateToken, async (req, res) => {
    const limit = 10;
    try {
        const question = await Question.findOne({id: req.query.questionID})

        if(question.answers.length == 0) return res.json([])
        const answerIDs = question.answers
        let answers = []
        for (let i = 0; i < answerIDs.length; i++) {
            answers[i] = (await Answer.findOne({id: answerIDs[i]}) )
        }
        answers.sort((a, b) => new Date(b.created) - new Date(a.created));

        answers = answers.slice(0, limit)
        res.json(answers)
    } 
    catch (err) { res.status(500).json(err) }
})

router.delete('/delete-question', authenticateToken, async (req, res) => {
    const question = await Question.findOneAndDelete(
        { id: req.query.questionID },
        { new: true }
    );
    if(!question) return res.json({notFound: true, msg: "Question not found in the Database"})

    const user = await User.findOneAndUpdate(
        { email: question.poster }, 
        { $pull: { questions: question.id } },
        { new: true } 
    ); 
    const answers = await Answer.find({ question: question.id });

    await Answer.deleteMany({ question: question.id });

    await Promise.all( answers.map( (answer) => 
            User.findOneAndUpdate(
                { email: answer.poster },
                { $pull: { answers: answer.id } },
                { new: true }
            )
        )
    );    
    res.json(question)
})

async function findQuestions(substring) {
    try {
        const questions = await Question.find({ title: { $regex: substring, $options: "i" } })
        return questions;
    } catch (err) {
        console.error(err);
        return [];
    }
}

router.get('/search', authenticateToken, async (req, res) => {
    let limit = 30
    try {
        const questions = await findQuestions(req.query.item);
        questions.sort((a, b) => new Date(b.created) - new Date(a.created));
        const questionsN = questions.slice(0, limit)
        res.json(questionsN)
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
});

module.exports = router