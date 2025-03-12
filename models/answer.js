const mongoose = require('mongoose')

const answerSchema = new mongoose.Schema({
    value: {
        type: String,
        trim: true,
        maxlength: [500, 'Answer cannot be more than 500 characters']
    },
    question: String,
    id: String,
    poster: String,
    created: { 
        type: Date, 
        default: Date.now 
    }
})

module.exports = mongoose.model('Answer', answerSchema)