const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema({ 
    title: {
        type: String,
        trim: true,
        maxlength: [50, 'Question title cannot be more than 50 characters']
    },
    value: {
        type: String,
        trim: true,
        maxlength: [500, 'Question cannot be more than 500 characters']
    },
    id: String,
    poster: String,
    answers: {
        type: [String]
    },
    created: { 
        type: Date, 
        default: Date.now 
    }
})

module.exports = mongoose.model('Question', questionSchema)
