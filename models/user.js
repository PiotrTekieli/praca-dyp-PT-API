const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    creationDate: {
        type: Date,
        default: Date.now()
    },
    logoutTime: {
        type: Number,
    },
    active: {
        type: Boolean,
        default: false
    }

})

module.exports = mongoose.model('User', userSchema)