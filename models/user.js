const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Must provide an email'],
        trim: true
    },
    f_name: {
        type: String,
        trim: true,
        maxlength: [25, 'Name cannot be more than 20 characters']
    },
    l_name: {
        type: String,
        trim: true,
        maxlength: [25, 'Name cannot be more than 20 characters']
    },
    course: {
        type: String,
        trim: true,
        maxlength: [25, 'Course cannot be more than 20 characters']
    },
    batch: {
        type: String,
        trim: true,
        maxlength: [4, 'Batch cannot be more than 4 characters']
    },
    questions: {
        type: [String]
    },
    answers: {
        type: [String]
    }
})

module.exports = mongoose.model('User', userSchema)