const mongoose = require('mongoose')

const connectDB = (url) => {
    return mongoose
    .connect(url)
    .catch((err) => console.log(err))
}

module.exports = connectDB