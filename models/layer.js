const mongoose = require('mongoose')

const layerSchema = new mongoose.Schema({
    file_id: {
        type: mongoose.ObjectId,
        required: true
    },
    index: {
        type: Number,
        required: true
    },
    layer_name: {
        type: String,
        required: true,
        default: "New Layer"
    },
    data: {
        type: String,
        required: true
    },
    opacity: {
        type: Number,
        required: true,
        default: 1
    },
    locked: {
        type: Boolean,
        required: true,
        default: true
    },
    visible: {
        type: Boolean,
        required: true,
        default: false
    },

})

module.exports = mongoose.model('Layer', layerSchema)