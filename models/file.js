const mongoose = require('mongoose')

const fileSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.ObjectId,
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    width: {
        type: Number,
        required: true
    },
    height: {
        type: Number,
        required: true
    },
    modify_date: {
        type: Number,
        default: Date.now()
    }
})

module.exports = mongoose.model('File', fileSchema)